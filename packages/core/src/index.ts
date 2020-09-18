import { IconFinderConfig } from './data/config';
import { Registry as RegistryClass } from './registry';
import { getRegistry } from './registry/storage';
import { PartialRoute, objectToRoute } from './route/types';
import { Router, RouterEvent } from './route/router';
import { CollectionInfo } from './converters/collection';
import { EventCallback } from './events';
import { Icon } from './icon';
import { CustomViewLoadCallback } from './views/custom';
import { convertCustomSets, IconFinderCustomSets } from './data/custom-sets';
import { getCollectionInfo } from './data/collections';

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
 * Export functions that are not specific to instance
 */

/**
 * Export various types and functions that do not depend on core instance
 */
// Provider
export {
	APIProviderSource,
	addProvider,
	getProvider,
	convertProviderData,
	listProviders,
} from './data/providers';

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
export { IconFinderConfig };
export {
	customisedConfig,
	mergeConfig,
	setComponentsConfig,
} from './data/config';

// From views
export { ViewBlocks } from './views/types';
export { CollectionsViewBlocks } from './views/collections';
export { CollectionViewBlocks } from './views/collection';
export { SearchViewBlocks } from './views/search';
export { IconsList, CustomViewBlocks } from './views/custom';

// From icons
export { Icon };
export { iconToString, validateIcon, compareIcons, stringToIcon } from './icon';

// Custom sets
export { IconFinderCustomSets };

// Objects
export { compareObjects, cloneObject } from './objects';

/**
 * Icon Finder core parameters
 */
export interface IconFinderCoreParams {
	// Namespace. Used to share configuration and API cache between instances. Defaults to 'iconify'
	namespace?: string;

	// Custom configuration
	config?: IconFinderConfig;

	// Default route. Null if no route should be set
	route?: PartialRoute | null;

	// Custom icon sets
	iconSets?: IconFinderCustomSets;

	// Callback for view updates
	callback: (data: RouterEvent, core: IconFinderCore) => void;

	// Callbacks for loading data
	custom?: {
		[index: string]: (callback: CustomViewLoadCallback) => void;
	};
}

/**
 * Icon Finder Core class
 */
export class IconFinderCore {
	protected readonly params: IconFinderCoreParams;
	public readonly registry: Registry;
	public readonly router: Router;
	public readonly id: string;

	constructor(params: IconFinderCoreParams) {
		this.params = params;

		// Get Registry instance
		const registry = (this.registry = new RegistryClass(params));
		this.id = registry.id;
		registry.setCustom('core', this, true);

		// Set custom icon sets
		if (params.iconSets) {
			registry.customIconSets = convertCustomSets(params.iconSets);
			console.log('Custom sets:', registry.customIconSets);
		}

		// Get other required classes from Registry
		const router = (this.router = registry.router);
		const events = registry.events;

		// Subscribe to events
		events.subscribe('render', this._routerEvent.bind(this));
		if (typeof params.custom === 'object' && params.custom !== null) {
			Object.keys(params.custom).forEach((customType) => {
				events.subscribe(
					'load-' + customType,
					(this._loadCustomIconsEvent.bind(
						this,
						customType
					) as unknown) as EventCallback
				);
			});
		}

		// Change route on next tick, so callback would be called asynchronously
		setTimeout(() => {
			if (router.route === null) {
				if (params.route !== void 0 && params.route !== null) {
					const route = objectToRoute(params.route);
					if (route !== null) {
						router.route = route;
					} else {
						router.home();
					}
				} else if (params.route !== null) {
					router.home();
				}
			}
		});
	}

	/**
	 * Get collection information
	 */
	getCollection(provider: string, prefix: string): CollectionInfo | null {
		return getCollectionInfo(this.registry.collections, provider, prefix);
	}

	/**
	 * Event was fired by router
	 */
	_routerEvent(data: unknown): void {
		this.params.callback(data as RouterEvent, this);
	}

	/**
	 * Load data
	 */
	_loadCustomIconsEvent(
		customType: string,
		callback: CustomViewLoadCallback
	): void {
		if (this.params.custom === void 0) {
			return;
		}
		this.params.custom[customType](callback);
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		this.registry.destroy();
	}
}

/**
 * Find Icon Finder Core instance for id
 */
export function getCoreInstance(id: string): IconFinderCore | undefined {
	const registry = getRegistry(id);
	return registry
		? (registry.getCustom('core', true) as IconFinderCore)
		: void 0;
}
