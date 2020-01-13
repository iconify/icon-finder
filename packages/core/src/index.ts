import { Data as DataClass, DataStorage, DataChildStorage } from './data';
import { createRegistry, Registry as RegistryClass } from './registry';
import { PartialRoute, objectToRoute } from './route/types';
import { Router, RouterEvent } from './route/router';

/**
 * Export data for various blocks
 */
export {
	CollectionInfoBlock,
	isCollectionInfoBlockEmpty,
} from './blocks/collection-info';

export {
	CollectionsFilterBlock,
	isCollectionsFilterBlockEmpty,
} from './blocks/collections-filter';

export {
	CollectionsListBlock,
	isCollectionsBlockEmpty,
	getCollectionsBlockCategories,
	getCollectionsBlockPrefixes,
	iterateCollectionsBlock,
} from './blocks/collections-list';

export {
	FiltersBlock,
	FiltersFilter,
	isFiltersBlockEmpty,
} from './blocks/filters';

export { IconsListBlock, isIconsListBlockEmpty } from './blocks/icons-list';

export {
	PaginationBlock,
	isPaginationEmpty,
	showPagination,
	maxPage,
} from './blocks/pagination';

export { SearchBlock, isSearchBlockEmpty } from './blocks/search';

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
export {
	Icon,
	ExtendedIcon,
	iconToString,
	validateIcon,
	compareIcons,
} from './icon';

/**
 * API core configuration
 */
interface APICoreConfig {
	// Namespace. Used to share configuration and API cache between instances. Defaults to 'iconify'
	namespace?: string;

	// Custom configuration
	config?: DataStorage;

	// Default route. Null if no route should be set
	defaultRoute?: PartialRoute | null;

	// Callback for view updates
	callback: (data: RouterEvent, core: APICore) => void;
}

/**
 * API core class
 */
export class APICore {
	protected readonly config: APICoreConfig;
	protected readonly registry: Registry;
	protected readonly router: Router;

	constructor(config: APICoreConfig) {
		this.config = config;

		const registry = (this.registry = createRegistry(config));
		const router = (this.router = registry.router);
		const events = registry.events;

		// Subscribe to events
		events.subscribe('render', this._routerEvent.bind(this));

		// Change route
		if (config.defaultRoute !== void 0 && config.defaultRoute !== null) {
			const route = objectToRoute(config.defaultRoute);
			if (route !== null) {
				router.route = route;
			} else {
				router.home();
			}
		} else if (config.defaultRoute !== null) {
			router.home();
		}
	}

	/**
	 * Event was fired by router
	 */
	_routerEvent(data: unknown): void {
		this.config.callback(data as RouterEvent, this);
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
}
