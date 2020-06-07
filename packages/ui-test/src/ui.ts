import {
	Icon,
	PartialRoute,
	APICore,
	APICoreConfig,
	RouterEvent,
	stringToIcon,
	compareIcons,
	validateIcon,
	compareObjects,
	cloneObject,
	// customisedConfig,
	// IconFinderConfig
} from '@iconify/search-core';
import { init } from '@iconify/search-components/lib/misc/init';
import Container from '@iconify/search-components/lib/ui/Container.svelte';

import { phrases } from '@iconify/search-components/lib/modules/phrases';
import { PropEventPayload } from '@iconify/search-components/lib/misc/events';

/**
 * Function called by UI when something changes
 */
export interface UICallback {
	(event: string, payload: unknown): void;
}

/**
 * Parameters for Main class
 */
export interface UIParams {
	// Container node
	container: Element;

	// Callback
	callback: (event: string, payload: unknown) => void;

	// Selected icon
	selectedIcon?: Icon | null;

	// Icon customisations
	// customisations?: PartialIconCustomisations;

	// Default route
	defaultRoute?: PartialRoute;

	// Route
	route?: PartialRoute;
}

/**
 * Value for 'prop' internal event
 */
interface PropertyEventPayload {
	prop: string;
	value: unknown;
}

/**
 * UI class
 */
export class UI {
	// Copy of parameters
	protected readonly _params: UIParams;

	// APICore instance, created in constructor
	protected readonly _core: APICore;

	// Container component, added on first render
	protected _container: Container | null = null;

	// Currently selected icon
	protected _selectedIcon: Icon | null = null;

	// Customisations
	// protected _customisations: PartialIconCustomisations;

	/**
	 * Constructor
	 */
	constructor(params: UIParams) {
		this._params = params;

		// Initialise APICore
		const config: APICoreConfig = {
			callback: this._render.bind(this),
		};
		if (typeof params.route === 'object') {
			config.route = params.route;
		}

		// Create APICore instance
		const core = (this._core = new APICore(config));
		const registry = core.getInternalRegistry();

		// Set phrases
		registry.setCustom('phrases', phrases);

		// Callback
		registry.setCustom('callback', this._internalCallback.bind(this));

		// Selected icon
		if (
			typeof params.selectedIcon === 'object' &&
			validateIcon(params.selectedIcon)
		) {
			this._selectedIcon = Object.assign({}, params.selectedIcon) as Icon;
		}

		// Init UI
		init(registry);
	}

	/**
	 * Select icon
	 */
	selectIcon(icon: Icon | null): void {
		if (compareIcons(icon as Icon, this._selectedIcon)) {
			return;
		}

		// Change icon, trigger event, change container parameter
		this._selectedIcon = icon;
		this._triggerEvent('selection', icon);
		if (this._container !== null) {
			this._container.$set({
				selectedIcon: icon,
			});
		}
	}

	/**
	 * Get current state
	 */
	getState(): Partial<UIParams> {
		const result: Partial<UIParams> = {};
		const registry = this._core.getInternalRegistry();

		// Get route
		result.route = registry.router.route;

		// Get customised config
		// result.config = customisedConfig(registry.config);

		// Selected icon
		result.selectedIcon =
			this._selectedIcon === null
				? null
				: Object.assign({}, this._selectedIcon);

		return result;
	}

	/**
	 * Create Container component
	 */
	_initContainer(data: RouterEvent): Container {
		// Properties
		const props = {
			...data,
			selectedIcon: this._selectedIcon,
			// iconProps: this._iconProps,
			registry: this._core.getInternalRegistry(),
		};

		// Create container
		return new Container({
			target: this._params.container,
			props,
		});
	}

	/**
	 * Render event
	 */
	_render(data: RouterEvent): void {
		if (this._container === void 0 || this._container === null) {
			this._container = this._initContainer(data);
			return;
		}

		const container = this._container as Container;

		// Debug
		console.log('Current state:', this.getState());

		// Check for changes
		if (
			data.viewChanged ||
			!compareObjects(data.route, container.$$.props.route)
		) {
			// Change everything
			container.$set(data);
			return;
		}

		// Route is the same, so if error changed, only error and blocks need update
		if (data.error !== container.$$.props.error) {
			container.$set({
				error: data.error,
				blocks: data.blocks,
			});
		}
	}

	/**
	 * Button was clicked in footer
	 */
	_footerButtonClicked(button: string): void {
		const data = {
			button,
			icon: cloneObject(this._selectedIcon),
		};
		this._triggerEvent('footer', data);
	}

	/**
	 * Trigger event
	 */
	_triggerEvent(event: string, payload: unknown): void {
		if (typeof this._params.callback === 'function') {
			this._params.callback(event, payload);
		}
	}

	/**
	 * Callback for events
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
				this.selectIcon(payload as Icon);
				return;

			case 'prop':
				// Property was changed
				console.log(
					'Changed property:',
					(payload as PropEventPayload).prop
				);
				return;

			case 'footer':
				// Button was clicked in footer
				this._footerButtonClicked(payload as string);
				return;
		}
	}
}
