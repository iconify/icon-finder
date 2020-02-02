import { Data as DataClass, DataStorage, DataChildStorage } from './data';
import { Registry as RegistryClass } from './registry';
import { getRegistry } from './registry/storage';
import { PartialRoute, objectToRoute } from './route/types';
import { Router, RouterEvent } from './route/router';
import { CollectionInfo } from './converters/collection';
import { EventCallback } from './events';
import { Icon } from './icon';
import { CustomViewLoadCallback } from './views/custom';

/**
 * Export data for various blocks
 */
export { BlockType, Block, isBlockEmpty } from './blocks/types';

export { CollectionInfoBlock } from './blocks/collection-info';

export { CollectionsFilterBlock } from './blocks/collections-filter';

export {
	CollectionsListBlock,
	getCollectionsBlockCategories,
	getCollectionsBlockPrefixes,
	iterateCollectionsBlock,
} from './blocks/collections-list';

export { FiltersBlock, FiltersFilter } from './blocks/filters';

export { IconsListBlock } from './blocks/icons-list';

export { PaginationBlock, showPagination, maxPage } from './blocks/pagination';

export { SearchBlock } from './blocks/search';

/**
 * Export various types
 */
// From routes
export { PartialRoute };
export {
	Route,
	CollectionsRoute,
	CollectionRoute,
	SearchRoute,
	CustomRoute,
} from './route/types';
export {
	RouteParams,
	CollectionsRouteParams,
	CollectionRouteParams,
	SearchRouteParams,
	CustomRouteParams,
} from './route/params';

// From router
export { Router, RouterEvent };

// From registry
export type Registry = RegistryClass;

// From config
export type Data = DataClass;
export { DataStorage, DataChildStorage };

// From views
export { ViewBlocks } from './views/types';
export { CollectionsViewBlocks } from './views/collections';
export { CollectionViewBlocks } from './views/collection';
export { SearchViewBlocks } from './views/search';
export { IconsList, CustomViewBlocks } from './views/custom';

// From icons
export { Icon };
export { iconToString, validateIcon, compareIcons } from './icon';

/**
 * API core configuration
 */
export interface APICoreConfig {
	// Namespace. Used to share configuration and API cache between instances. Defaults to 'iconify'
	namespace?: string;

	// Custom configuration
	config?: DataStorage;

	// Default route. Null if no route should be set
	route?: PartialRoute | null;

	// Callback for view updates
	callback: (data: RouterEvent, core: APICore) => void;

	// Callbacks for loading data
	custom?: {
		[index: string]: (callback: CustomViewLoadCallback) => void;
	};
}

/**
 * API core class
 */
export class APICore {
	protected readonly config: APICoreConfig;
	protected readonly registry: Registry;
	protected readonly router: Router;
	public readonly id: string;

	constructor(config: APICoreConfig) {
		this.config = config;

		// Get Registry instance
		const registry = (this.registry = new RegistryClass(config));
		this.id = registry.id;
		registry.setCustom('APICore', this, true);

		// Get other required classes from Registry
		const router = (this.router = registry.router);
		const events = registry.events;

		// Subscribe to events
		events.subscribe('render', this._routerEvent.bind(this));
		if (typeof config.custom === 'object' && config.custom !== null) {
			Object.keys(config.custom).forEach(customType => {
				events.subscribe(
					'load-' + customType,
					this._loadCustomIconsEvent.bind(
						this,
						customType
					) as EventCallback
				);
			});
		}

		// Change route on next tick, so callback would be called asynchronously
		setTimeout(() => {
			if (router.route === null) {
				if (config.route !== void 0 && config.route !== null) {
					const route = objectToRoute(config.route);
					if (route !== null) {
						router.route = route;
					} else {
						router.home();
					}
				} else if (config.route !== null) {
					router.home();
				}
			}
		});
	}

	/**
	 * Get collection information
	 */
	getCollection(prefix: string): CollectionInfo | null {
		const collections = this.registry.collections;
		return collections.get(prefix);
	}

	/**
	 * Event was fired by router
	 */
	_routerEvent(data: unknown): void {
		this.config.callback(data as RouterEvent, this);
	}

	/**
	 * Load data
	 */
	_loadCustomIconsEvent(
		customType: string,
		callback: CustomViewLoadCallback
	): void {
		if (this.config.custom === void 0) {
			return;
		}
		this.config.custom[customType](callback);
	}

	/**
	 * Get router instance
	 */
	getRouter(): Router {
		return this.router;
	}

	/**
	 * Get registry instance. Used for customise behavior
	 */
	getInternalRegistry(): Registry {
		return this.registry;
	}

	/**
	 * Destroy instance
	 */
	destroy() {
		this.registry.destroy();
	}
}

/**
 * Find APICore instance for id
 */
export function getAPICoreInstance(id: string): APICore | undefined {
	const registry = getRegistry(id);
	return registry ? (registry.getCustom('APICore', true) as APICore) : void 0;
}
