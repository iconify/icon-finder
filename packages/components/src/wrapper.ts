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
	customisedConfig,
} from '@iconify/search-core';
import { phrases } from './modules/phrases';
import { init } from './misc/init';
import {
	UIEvent,
	UISelectionEvent,
	UICustomisationEvent,
	UIFooterButtonEvent,
} from './ui/events';
import { IconFinderWrapperParams } from './wrapper/params';
import { IconFinderState } from './wrapper/state';
import {
	SvelteComponentInstance,
	SvelteComponentOptions,
} from './wrapper/svelte';
import { IconFinderEvent } from './wrapper/events';
import { PartialIconCustomisations } from './misc/customisations';
import { Registry } from '@iconify/search-core/lib/registry';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never) {}

/**
 * Wrapper class
 */
export class Wrapper {
	// Parameters
	protected _params: IconFinderWrapperParams;

	// Current state, always up to date
	protected _state: IconFinderState = {
		icon: null,
	};

	// Core instance and registry
	protected readonly _core: APICore;
	protected readonly _registry: Registry;

	// Container component, added on first render
	protected _container: SvelteComponentInstance | null = null;

	/**
	 * Constructor
	 */
	constructor(params: IconFinderWrapperParams) {
		this._params = params;
		const customState = params.state;

		// Initialise APICore
		const config: APICoreConfig = {
			callback: this._coreCallback.bind(this),
		};
		if (customState && customState.config) {
			config.config = customState.config;
		}
		const core = (this._core = new APICore(config));
		const registry = (this._registry = core.getInternalRegistry());

		// Set phrases
		registry.setCustom('phrases', phrases);

		// Callback
		registry.setCustom('callback', this._internalCallback.bind(this));

		// Initialise UI
		init(registry);

		// Set initial state
		const state = this._state;
		state.route = registry.route;
		state.config = customisedConfig(registry.config);

		if (customState) {
			// Set custom stuff
			if (customState.icon) {
				state.icon = customState.icon;
			}
			if (customState.customisations) {
				state.customisations = customState.customisations;
			}
			if (customState.route) {
				setTimeout(() => {
					// Set on next tick
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					registry.route = customState.route!;
				});
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
	 * Get current state
	 */
	getState(): IconFinderState {
		return this._state;
	}

	/**
	 * Create Container component
	 */
	_initContainer(data: RouterEvent): SvelteComponentInstance {
		const state = this._state;

		// Properties
		const props = {
			...data,
			selectedIcon: state.icon,
			customisations: state.customisations,
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
			this._setRoute(data.route, false);
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
				this._setRoute(data.route, false);
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
	_internalCallback(event: UIEvent): void {
		// console.log('Internal event:', event);

		let icon: Icon | null;
		let selectionEvent: UISelectionEvent;

		const type = event.type;
		switch (type) {
			case 'selection':
				// Selected icon changed: trigger event and update container (this event does not automatically update container)
				selectionEvent = event as UISelectionEvent;
				if (typeof selectionEvent.icon === 'string') {
					icon = stringToIcon(selectionEvent.icon);
				} else {
					// Copy object
					icon = selectionEvent.icon
						? {
								provider: selectionEvent.icon.provider,
								prefix: selectionEvent.icon.prefix,
								name: selectionEvent.icon.name,
						  }
						: null;
				}
				this._selectIcon(icon, true);
				return;

			case 'customisation':
				// Customisation was clicked: trigger event
				this._setCustomisations(
					(event as UICustomisationEvent).customisations,
					false
				);
				return;

			case 'button':
				// Button was clicked: trigger event
				this._triggerEvent({
					type: 'button',
					button: (event as UIFooterButtonEvent).button,
					state: this._state,
				});
				return;

			case 'config':
				// Configuration changed: trigger event
				this._state.config = customisedConfig(this._registry.config);
				this._triggerEvent({
					type: 'config',
					config: this._state.config,
				});
				return;

			default:
				// Should never reach this code
				assertNever(type);
		}
	}

	/**
	 * Set route
	 */
	_setRoute(route: PartialRoute, updateContainer: boolean): boolean {
		const state = this._state;

		// Check if route has changed
		if (state.route === void 0 || !compareObjects(route, state.route)) {
			state.route = route;
			this._triggerEvent({
				type: 'route',
				route,
			});

			// @TODO: update container
			if (updateContainer) {
				console.log('TODO: update route in container');
			}

			return true;
		}
		return false;
	}

	/**
	 * Set route
	 */
	setRoute(route: PartialRoute | null) {
		const router = this._core.getRouter();
		function loadRoute() {
			if (route === null) {
				// Navigate to home page
				router.home();
			} else {
				router.route = route;
			}
		}

		if (!this._container) {
			// Load on next tick
			setTimeout(loadRoute);
		} else {
			loadRoute();
		}
	}

	/**
	 * Select icon
	 */
	_selectIcon(icon: Icon | null, updateContainer: boolean): boolean {
		const state = this._state;

		// Check if icon has changed
		if (
			!this._container ||
			(!icon && !state.icon) ||
			(state.icon && icon && compareIcons(icon, state.icon))
		) {
			return false;
		}

		// Change state and container
		state.icon = icon;
		if (updateContainer) {
			this._container.$set({
				selectedIcon: icon,
			});
		}

		// Trigger event
		this._triggerEvent({
			type: 'icon',
			icon,
		});
		return true;
	}

	/**
	 * Select icon
	 */
	selectIcon(icon: Icon | string | null): void {
		let iconValue: Icon | null;

		if (!this._container) {
			return;
		}

		// Convert and validate icon
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

		this._selectIcon(iconValue, true);
	}

	/**
	 * Change customisations
	 */
	_setCustomisations(
		customisations: PartialIconCustomisations,
		updateContainer: boolean
	): boolean {
		const state = this._state;
		if (
			!this._container ||
			(state.customisations !== void 0 &&
				compareObjects(state.customisations, customisations))
		) {
			return false;
		}

		// Change state
		state.customisations = customisations;

		// Update container
		if (updateContainer) {
			this._container.$set({
				customisations,
			});
		}

		// Trigger evemt
		this._triggerEvent({
			type: 'customisations',
			customisations,
		});
		return true;
	}

	/**
	 * Change customisations
	 */
	setCustomisations(customisations: PartialIconCustomisations): void {
		this._setCustomisations(customisations, true);
	}
}
