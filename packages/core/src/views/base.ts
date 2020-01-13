import { APIParams } from '../api/base';
import { getRegistry } from '../registry';
import { PartialRoute } from '../route/types';

/**
 * View error
 *
 * Errors:
 * 	'' - none
 * 	'timeout' - API call timed out
 * 	'invalid_data' - invalid data was sent from API
 * 	'empty' - view is empty (after parsing API response, before applying route filters)
 */
export type ViewError = '' | 'timeout' | 'invalid_data' | 'empty';

/**
 * Blocks
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BaseViewBlocks {}

/**
 * Base view class
 */
export class BaseView {
	protected _instance!: string;
	public type = '';
	public parent: BaseView | null = null;
	public updating = false;
	public error: ViewError = '';
	public blocksRequireUpdate = true;

	// Loading status
	public loading = true;
	protected _loadingTimer: unknown = null;
	protected _alreadyLoaded = false;
	protected _startedLoading = false;

	// Loading control: waiting for parent view
	public onLoad: (() => void) | null = null;
	protected _mustWaitForParent = false;

	/**
	 * Change parent view
	 */
	_parentAction(value: unknown): void {
		if (this.parent === null) {
			return;
		}

		const levels = typeof value === 'number' && value > 0 ? value : 1;
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.setParentView(levels);
	}

	/**
	 * Start loading
	 */
	startLoading(): void {
		if (this._startedLoading) {
			return;
		}

		// Already loaded somehow (by setting data directly)
		if (!this.loading) {
			this._startedLoading = true;
			return;
		}

		// Start loading
		if (this._mustWaitForParent && this.parent !== null) {
			this.parent.startLoading();
		}
		this._startLoading();
	}

	_startLoading(): void {
		throw new Error('startLoading should not be called on base view');
	}

	/**
	 * Search action
	 */
	_searchAction(value: unknown): void {
		if (typeof value !== 'string' || value.trim() === '') {
			return;
		}

		const keyword = (value as string).trim().toLowerCase();

		// Check for collections
		let view = this as BaseView;
		let levels = 0;
		while (view.type !== 'collections') {
			if (view.parent === null) {
				return;
			}
			view = view.parent;
			levels++;
		}

		// Apply action to collections
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.createChildView(
			{
				type: 'search',
				params: {
					search: keyword,
				},
			} as PartialRoute,
			levels
		);
	}

	/**
	 * Load data from API
	 */
	_loadAPI(query: string, params: APIParams): void {
		const registry = getRegistry(this._instance);
		const api = registry.api;
		const config = registry.config;
		const configAPIData = config.data.API;

		// Calculate and create timer
		let timeout = 0;
		if (
			typeof configAPIData.rotate === 'number' &&
			typeof configAPIData.timeout === 'number' &&
			typeof configAPIData.limit === 'number' &&
			configAPIData.limit > 0
		) {
			// Calculate maximum possible timeout per one rotation
			timeout =
				configAPIData.timeout +
				configAPIData.rotate *
					((configAPIData.resources as string[]).length - 1);
			timeout *= configAPIData.limit;
		}
		if (timeout > 0) {
			this._loadingTimer = setTimeout(() => {
				if (this._loadingTimer !== null) {
					clearTimeout(this._loadingTimer as number);
					this._loadingTimer = null;
				}
				if (this.loading && this.error === '') {
					this.error = 'timeout';
					this.loading = false;
					this._triggerLoaded();
				}
			}, timeout);
		}

		// Send query
		api.query(query, params, data => {
			// Clear timeout
			if (this._loadingTimer !== null) {
				clearTimeout(this._loadingTimer as number);
				this._loadingTimer = null;
			}

			// Parse data after parent view has finished loading
			this._waitForParent(() => {
				this._parseAPIData(data);
			});
		});
	}

	/**
	 * Wait for parent view to load
	 */
	_waitForParent(callback: () => void): void {
		if (
			!this._mustWaitForParent ||
			this.parent === null ||
			!this.parent.loading
		) {
			callback();
			return;
		}

		// Wait for parent
		this.parent.onLoad = callback;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-unused-vars
	_parseAPIData(data: unknown): void {
		throw new Error('_parseAPIData should not be called on base view');
	}

	/**
	 * Send event when view has been loaded
	 *
	 * Can be sent synchronously
	 */
	_triggerLoaded(): void {
		if (this._alreadyLoaded) {
			// Do not trigger event twice
			this._triggerUpdated();
			return;
		}
		this._alreadyLoaded = true;

		const registry = getRegistry(this._instance);
		const events = registry.events;
		events.fire('view-loaded', this);

		// Trigger onLoad event for child view
		if (this.onLoad !== null) {
			const onLoad = this.onLoad;
			this.onLoad = null;
			onLoad();
		}
	}

	/**
	 * Send event when view has been updated
	 *
	 * Must be sent asynchronously to consume multiple updates
	 */
	_triggerUpdated(): void {
		if (!this.updating) {
			this.updating = true;
			setTimeout(() => {
				this.updating = false;
				const registry = getRegistry(this._instance);
				const events = registry.events;
				events.fire('view-updated', this);
			});
		}
	}
}
