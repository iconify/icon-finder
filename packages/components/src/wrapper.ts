import {
	Icon,
	PartialRoute,
	APICore,
	APICoreConfig,
	RouterEvent,
	compareObjects,
	stringToIcon,
	compareIcons,
	validateIcon,
} from '@iconify/search-core';
import { phrases } from './modules/phrases';
import { init } from './misc/init';
import { PropEventPayload } from './misc/events';
import { IconFinderWrapperParams } from './wrapper/params';
import { IconFinderState } from './wrapper/state';
import {
	SvelteComponentInstance,
	SvelteComponentOptions,
} from './wrapper/svelte';
import { IconFinderEvent } from './wrapper/events';

/**
 * Wrapper class
 */
export class Wrapper {
	// Parameters
	protected _params: IconFinderWrapperParams;

	// Current state, always up to date
	public state: IconFinderState = {
		icon: null,
	};

	// Core instance
	protected readonly _core: APICore;

	// Container component, added on first render
	protected _container: SvelteComponentInstance | null = null;

	/**
	 * Constructor
	 */
	constructor(params: IconFinderWrapperParams) {
		this._params = params;

		// Initialise APICore
		const config: APICoreConfig = {
			callback: this._coreCallback.bind(this),
		};
		const core = (this._core = new APICore(config));
		const registry = core.getInternalRegistry();

		// Set phrases
		registry.setCustom('phrases', phrases);

		// Callback
		registry.setCustom('callback', this._internalCallback.bind(this));

		// Initialise UI
		init(registry);

		// Set initial state
		if (!params.state) {
			this.state.route = registry.route;
		} else {
			const customState = params.state;
			if (customState.route) {
				this.state.route = registry.route = customState.route;
			}
			if (customState.icon) {
				this.state.icon = customState.icon;
			}
		}
	}

	/**
	 * Check if container has been loaded
	 */
	loaded(): boolean {
		return this._container !== null;
	}

	/**
	 * Create Container component
	 */
	_initContainer(data: RouterEvent): SvelteComponentInstance {
		const state = this.state;

		// Properties
		const props = {
			...data,
			selectedIcon: state.icon,
			registry: this._core.getInternalRegistry(),
		};

		// Constructor parameters
		const params: SvelteComponentOptions = {
			target: this._params.container,
			props,
		};

		// Create container
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		return new this._params.component(params);
	}

	/**
	 * Trigger event
	 */
	_triggerEvent(event: IconFinderEvent): void {
		if (this._params.callback) {
			this._params.callback(event);
		}
	}

	/**
	 * Callback from core
	 */
	_coreCallback(data: RouterEvent): void {
		if (this._container === void 0 || this._container === null) {
			// Create container on first render
			this._container = this._initContainer(data);
			this._triggerEvent({
				type: 'load',
			});

			// Save route
			this._setRoute(data.route);
		} else {
			const container = this._container;

			// Check for changes
			if (
				data.viewChanged ||
				!compareObjects(data.route, container.$$.props.route)
			) {
				// Change everything
				container.$set(data);

				// Save route
				this._setRoute(data.route);
			} else {
				// Route is the same, so if error has changed, only error and blocks need update
				if (
					data.error === '' ||
					data.error !== container.$$.props.error
				) {
					container.$set({
						error: data.error,
						blocks: data.blocks,
					});
				}
			}
		}
	}

	/**
	 * Select icon
	 */
	_internalCallback(event: string, payload: unknown): void {
		switch (event) {
			case 'selection':
				// Selected icon changed
				if (typeof payload === 'string') {
					payload = stringToIcon(payload);
					if (!payload) {
						return;
					}
				}
				this._selectIcon(payload as Icon);
				return;
		}
	}

	/**
	 * Set route
	 */
	_setRoute(route: PartialRoute): void {
		const state = this.state;
		if (!compareObjects(route, state.route)) {
			state.route = route;
			this._triggerEvent({
				type: 'route',
				route,
			});
		}
	}

	/**
	 * Select icon
	 */
	_selectIcon(icon: Icon | null) {
		const state = this.state;

		// Check if icon has changed
		if (
			!this._container ||
			(!icon && !state.icon) ||
			(state.icon && icon && compareIcons(icon, state.icon))
		) {
			return;
		}

		// Change state, container and trigger event
		state.icon = icon;
		this._container.$set({
			selectedIcon: icon,
		});
		this._triggerEvent({
			type: 'icon',
			icon,
		});
	}

	/**
	 * Select icon
	 */
	selectIcon(icon: Icon | string | null): void {
		let iconValue: Icon | null;
		if (typeof icon === 'string') {
			// Convert from string. Allow empty string to reset selected icon
			if (icon === '') {
				iconValue = null;
			} else {
				iconValue = stringToIcon(icon);
				if (!validateIcon(iconValue)) {
					return;
				}
			}
		} else {
			iconValue = icon;
		}

		this._selectIcon(iconValue);
	}
}
