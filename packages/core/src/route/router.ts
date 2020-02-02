import { getRegistry } from '../registry/storage';
import { View, ViewBlocks } from '../views/types';
import { Route, objectToRoute, routeToObject, PartialRoute } from './types';
import { CollectionsView } from '../views/collections';
import { CollectionView } from '../views/collection';
import { SearchView } from '../views/search';
import { CustomView, IconsList } from '../views/custom';

/**
 * TypeScript guard
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * Interface for public view_loaded and view_updated events
 */
export interface RouterEvent {
	// True if view is different than previous view
	viewChanged: boolean;

	// Error string
	error: string;

	// Current route
	route: PartialRoute;

	// Blocks to display
	blocks: ViewBlocks | null;
}

/**
 * Router class
 */
export class Router {
	protected readonly _instance: string;

	// Current view
	protected _view: View | null = null;

	// Currently visible view, could be different than current view
	protected _visibleView: View | null = null;

	// Timer for replacing view
	protected _timer: unknown = null;

	/**
	 * Constructor
	 *
	 * @param instance
	 * @param callback
	 */
	constructor(instance: string) {
		this._instance = instance;

		const registry = getRegistry(this._instance);

		// Subscribe to view events, handle them in same handler
		const events = registry.events;
		events.subscribe('view-loaded', view => {
			this._viewEvent(view as View);
		});
		events.subscribe('view-updated', view => {
			this._viewEvent(view as View);
		});
	}

	/**
	 * Get current error message
	 */
	error(): string {
		return this._visibleView === null || this._visibleView.loading
			? 'loading'
			: this._visibleView.error;
	}

	/**
	 * Render currently visible view
	 */
	render(): ViewBlocks | null {
		return this._visibleView === null ? null : this._visibleView.render();
	}

	/**
	 * Set or get current route
	 */
	set route(route: PartialRoute) {
		let view;

		// Clean up route
		const cleanRoute: Route | null =
			route === null ? null : objectToRoute(route);

		// Attempt to create view
		if (
			cleanRoute !== null &&
			(view = this._viewFromRoute(cleanRoute)) !== null
		) {
			this._setView(view, true);
			return;
		}

		// Error - navigate to home
		this.home();
	}

	get route(): PartialRoute {
		return this._visibleView === null
			? null
			: (routeToObject(this._visibleView.route) as Route);
	}

	/**
	 * Navigate to home
	 */
	home(): void {
		const registry = getRegistry(this._instance);
		const config = registry.config;

		// Generate route
		const route = objectToRoute(
			JSON.parse(config.data.router.home as string)
		);
		if (route === null) {
			throw new Error('Error resetting route');
		}

		// Generate view
		const view = this._viewFromRoute(route);
		if (view === null) {
			throw new Error('Error resetting route');
		}

		// Change view
		this._setView(view, true);
	}

	/**
	 * Apply action to currently visible view
	 */
	action(action: string, value: unknown): void {
		if (this._visibleView === null) {
			return;
		}

		// If visible view does not match current view, reset pending view. Action overrides previous view change
		this._changeCurrentView();

		// Apply action to current view
		this._visibleView.action(action, value);
	}

	/**
	 * Set icons to view with matching customType
	 *
	 * View must be visible or pending
	 */
	setCustomIcons(customType: string, icons: IconsList): boolean {
		const view = this._getCustomView(customType);
		if (view !== null) {
			view.setIcons(icons);
			return true;
		}
		return false;
	}

	/**
	 * Get custom icons
	 */
	getCustomIcons(customType: string): IconsList | null {
		const view = this._getCustomView(customType);
		return view === null ? null : view.getIcons();
	}

	/**
	 * Find custom view
	 */
	_getCustomView(customType: string): CustomView | null {
		if (this._visibleView === null || this._view === null) {
			return null;
		}

		// Check visible view
		if (
			this._visibleView.type === 'custom' &&
			(this._visibleView as CustomView).type === customType
		) {
			return this._visibleView as CustomView;
		}

		// Check pending view
		if (
			this._view.type === 'custom' &&
			(this._view as CustomView).type === customType
		) {
			return this._view as CustomView;
		}

		return null;
	}

	/**
	 * Create child view
	 */
	createChildView(route: PartialRoute, parentLevels = 0): void {
		const cleanRoute: Route | null =
			route === null ? null : objectToRoute(route);

		if (cleanRoute === null) {
			return;
		}

		// Set parent view
		let parentView: View | null = this._visibleView;
		for (let i = 0; i < parentLevels; i++) {
			if (parentView !== null) {
				parentView = parentView.parent as View;
			}
		}

		// Create view
		const view = this._viewFromRoute(cleanRoute, parentView);
		if (view === null) {
			return;
		}

		// Reset pending view
		this._changeCurrentView();

		// Set it as new view, but not immediately
		this._setView(view, false);
	}

	/**
	 * Go up in parent views tree by "levels"
	 */
	setParentView(levels = 1): void {
		let view = this._visibleView as View;

		for (let i = 0; i < levels; i++) {
			if (view === null || view.parent === null) {
				return;
			}
			view = view.parent as View;
		}

		if (view !== this._visibleView) {
			this._setView(view, true);
		}
	}

	/**
	 * Set view
	 */
	_setView(view: View, immediate: boolean): void {
		this._view = view;
		view.startLoading();

		if (
			(immediate && this._visibleView !== view) ||
			!view.loading ||
			this._visibleView === null
		) {
			// Change visible view immediately and trigger event
			this._visibleView = view;
			this._triggerChange(true);
		} else {
			// Start timer that will change visible view and trigger event after delay
			this._startTimer();
		}
	}

	/**
	 * Reset current view to visible view
	 */
	_changeCurrentView(): boolean {
		if (this._view !== this._visibleView) {
			this._view = this._visibleView;
			this._stopTimer();
			return true;
		}

		return false;
	}

	/**
	 * Change visible view to current view
	 */
	_changeVisibleView(): boolean {
		if (this._view !== this._visibleView) {
			this._visibleView = this._view;
			this._stopTimer();
			this._triggerChange(true);
			return true;
		}

		return false;
	}

	/**
	 * Create view from route
	 */
	_viewFromRoute(
		route: Route,
		parentView: View | null | undefined = void 0
	): View | null {
		// Get parent view
		let parent: View | null = null;
		if (parentView !== void 0) {
			parent = parentView;
			route.parent = parentView === null ? null : parentView.route;
		} else if (route.parent !== null) {
			parent = this._viewFromRoute(route.parent);
			if (parent === null) {
				return null;
			}
		}

		// Create view
		switch (route.type) {
			case 'collections':
				return new CollectionsView(this._instance, route, parent);

			case 'collection':
				return new CollectionView(this._instance, route, parent);

			case 'search':
				return new SearchView(this._instance, route, parent);

			case 'custom':
				return new CustomView(this._instance, route, parent);

			default:
				assertNever(route);
				return null;
		}
	}

	/**
	 * Handle event from view
	 */
	_viewEvent(view: View): void {
		if (view !== this._view) {
			// Action for different view - ignore it
			return;
		}

		// Change visible view if it doesn't match view.
		// Function also calls _triggerChange(true)
		if (this._changeVisibleView()) {
			return;
		}

		// Something changed in visible view
		this._triggerChange(false);
	}

	/**
	 * Something has changed in visible view
	 */
	_triggerChange(viewChanged: boolean): void {
		const registry = getRegistry(this._instance);
		const events = registry.events;

		// Render blocks first, it might change error or route
		const blocks = this.render();

		// Create item
		const item: RouterEvent = {
			viewChanged,
			error: this.error(),
			route: this.route,
			blocks,
		};

		events.fire('render', item);
	}

	/**
	 * Start timer to change visible view
	 */
	_startTimer(): void {
		this._stopTimer();

		const registry = getRegistry(this._instance);
		const config = registry.config;

		const timeout = config.data.display.viewUpdateDelay as number;
		if (!timeout) {
			this._changeVisibleView();
		} else {
			// Store current view, change it on timer
			const view = this._view;
			this._timer = setTimeout(() => {
				if (this._view === view) {
					this._changeVisibleView();
				}
			}, timeout);
		}
	}

	/**
	 * Stop loading timer
	 */
	_stopTimer(): void {
		if (this._timer !== null) {
			clearTimeout(this._timer as number);
			this._timer = null;
		}
	}
}
