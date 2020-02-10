import Container from './Container.svelte';
import { Options, DataStorage } from '../misc/options';
import {
	Icon,
	PartialRoute,
	APICore,
	APICoreConfig,
	RouterEvent,
	stringToIcon,
	compareIcons,
	validateIcon,
} from '../../../core/lib';
import { compare, clone } from '../../../core/lib/objects';
import { Data } from '../../../core/lib/data';
import { phrases } from '../modules/phrases';
import {
	exportCustomProperties,
	PartialIconProperties,
	ExtendedIconProperties,
	iconProps,
} from '../misc/icon-properties';

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

	// Custom options (includes core config) and changes to default options
	options?: DataStorage;
	defaultOptions?: DataStorage;

	// Selected icon
	selectedIcon?: Icon | null;

	// Icon properties
	iconProps?: PartialIconProperties;

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
export class Main {
	// Copy of parameters
	protected readonly _params: UIParams;

	// APICore instance, created in constructor
	protected readonly _core: APICore;

	// Container component, added on first render
	protected _container: Container | null = null;

	// Currently selected icon
	protected _selectedIcon: Icon | null = null;

	// Icon properties
	protected _iconProps: PartialIconProperties;

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

		// Options
		const options = new Options(params.options, params.defaultOptions);
		registry.setCustom('optionsInstance', options);
		registry.setCustom('options', options.data);

		if (typeof params.options === 'object') {
			// Merge custom options with core config
			const coreConfig = registry.config;
			coreConfig.set(params.options);
		}

		// Selected icon
		if (
			typeof params.selectedIcon === 'object' &&
			validateIcon(params.selectedIcon)
		) {
			this._selectedIcon = Object.assign({}, params.selectedIcon) as Icon;
		}

		// Icon properties
		this._iconProps = {};
		const props =
			typeof params.iconProps === 'object' && params.iconProps !== null
				? params.iconProps
				: {};

		Object.keys(iconProps).forEach(key => {
			const prop = key as keyof ExtendedIconProperties;
			const defaultValue = iconProps[prop]!.emptyValue;

			(this._iconProps as Record<string, unknown>)[prop] =
				typeof props[prop] === typeof defaultValue
					? props[prop]
					: iconProps[prop]!.emptyValue;
		});
		registry.setCustom('defaultProps', iconProps);
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

		// Get customised options
		result.options = (registry.getCustom(
			'optionsInstance'
		) as Data).customised();
		Object.assign(result.options, registry.config.customised());

		// Selected icon
		result.selectedIcon =
			this._selectedIcon === null
				? null
				: Object.assign({}, this._selectedIcon);

		// Icon properties
		result.iconProps = exportCustomProperties(iconProps, this._iconProps);

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
			iconProps: this._iconProps,
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
			!compare(data.route, container.$$.props.route)
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
			icon: clone(this._selectedIcon),
		};
		this._triggerEvent('footer', data);
	}

	/**
	 * Icon property was changed
	 */
	_iconPropertyChanged(value: PropertyEventPayload): void {
		console.log('_iconPropertyChanged', value);

		// Replace properties object to trigger footer re-render
		const props: PartialIconProperties = { ...this._iconProps };
		(props as Record<string, unknown>)[value.prop] = value.value;
		this._iconProps = props;

		// Trigger event
		this._triggerEvent(
			'properties',
			exportCustomProperties(iconProps, this._iconProps)
		);

		// Update container
		if (this._container !== null) {
			this._container.$set({
				iconProps: props,
			});
		}
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
				this._iconPropertyChanged(payload as PropertyEventPayload);
				return;

			case 'footer':
				// Button was clicked in footer
				this._footerButtonClicked(payload as string);
				return;
		}
	}
}
