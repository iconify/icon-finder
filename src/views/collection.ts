import type { BaseViewBlocks } from './base';
import { BaseView } from './base';
import type { CollectionInfoBlock } from '../blocks/collection-info';
import { defaultCollectionInfoBlock } from '../blocks/collection-info';
import type { FiltersBlock } from '../blocks/filters';
import {
	defaultFiltersBlock,
	defaultFilter,
	autoIndexFilters,
} from '../blocks/filters';
import type { FullCollectionRoute } from '../route/types/routes';
import type { CollectionData } from '../converters/collection';
import type { CollectionInfo } from '../converters/info';
import { dataToCollection } from '../converters/collection';
import type { IconsListBlock } from '../blocks/icons-list';
import { defaultIconsListBlock, applyIconFilters } from '../blocks/icons-list';
import type { PaginationBlock } from '../blocks/pagination';
import {
	defaultPaginationBlock,
	maxPage,
	getPageForIndex,
} from '../blocks/pagination';
import type { IconsNavBlock } from '../blocks/icons-nav';
import { getRegistry } from '../registry/storage';
import type { SearchBlock } from '../blocks/search';
import { defaultSearchBlock } from '../blocks/search';
import type { View } from './types';
import type { PartialCollectionRouteFilterParams } from '../route/types/params';
import type { SearchView } from './search';
import type { CollectionsView } from './collections';
import { collectionsPrefixesWithInfo } from '../blocks/collections-list';
import { getCollectionInfo, setCollectionInfo } from '../data/collections';
import type { Icon } from '../misc/icon';
import { APIParams, collectionCacheKey } from '../api/base';
import type { IconFinderConvertedCache } from '../converters/cache';

/**
 * Filters for block
 *
 * Split into separate interface for iteration.
 * Important: keys must match keys in CollectionData interface for easy iteration!
 */
export interface CollectionViewBlocksIconFilters {
	tags: FiltersBlock | null;
	themePrefixes: FiltersBlock | null;
	themeSuffixes: FiltersBlock | null;
}

const filterKeys: (keyof CollectionViewBlocksIconFilters)[] = [
	'tags',
	'themePrefixes',
	'themeSuffixes',
];

/**
 * Blocks
 */
export interface CollectionViewBlocks
	extends BaseViewBlocks,
		CollectionViewBlocksIconFilters {
	// Info
	'info': CollectionInfoBlock;

	// Search
	'filter': SearchBlock;

	// Filter from search block
	'collections': FiltersBlock | null;

	// Icons and pagination
	'icons': IconsListBlock;
	'pagination': PaginationBlock;
	'icons-nav': IconsNavBlock | null;
}

/**
 * Class
 */
export class CollectionView extends BaseView {
	public readonly provider: string;
	public readonly route: FullCollectionRoute;

	protected _data: CollectionData | null = null;
	protected _blocks: CollectionViewBlocks | null = null;
	protected readonly _isCustom: boolean;

	// Copy of route variable for faster access and to make sure it does not change
	public readonly prefix: string;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: FullCollectionRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'collection';
		this._instance = instance;
		this.route = route;
		this.provider = route.params.provider;
		this.parent = parent;
		this.prefix = route.params.prefix;

		// Check if custom icon set is used
		const registry = getRegistry(this._instance);
		const customSets = registry.customIconSets;
		if (
			customSets.providers[this.provider] !== void 0 &&
			customSets.providers[this.provider].data[this.prefix] !== void 0
		) {
			this._isCustom = true;
			this._data = customSets.providers[this.provider].data[this.prefix];
		} else {
			this._isCustom = false;
		}

		// Wait for parent to load if parent view is search or collections list
		this._mustWaitForParent =
			parent !== null &&
			(parent.type === 'search' || parent.type === 'collections');

		// Check for cache
		if (!this._data) {
			const cache = registry.getCustom('core-cache') as Record<
				string,
				IconFinderConvertedCache
			>;
			if (typeof cache === 'object' && cache[this.provider]) {
				const collectionCache = cache[this.provider].collection;
				if (collectionCache && collectionCache[this.prefix]) {
					this._data = collectionCache[this.prefix];
				}
			}
		}
	}

	/**
	 * Start loading
	 */
	_startLoadingData(): void {
		if (!this._data) {
			const params: APIParams = {
				prefix: this.prefix,
				info: 'true',
				chars: 'true',
				aliases: 'true',
			};
			if (this.route.params.icon !== '') {
				// Ask for hidden icons (icons that were removed from icon set) if route has a
				// reference icon, in case if reference icon is hidden.
				params.hidden = 'true';
			}
			this._loadAPI(
				this.provider,
				'/collection',
				params,
				collectionCacheKey(this.prefix)
			);
		} else {
			this._parseAPIData(null);
		}
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		switch (action) {
			// Select parent view
			case 'parent':
				this._parentAction(value);
				return;

			// Change provider
			case 'provider':
				if (value !== this.provider) {
					this._providerAction(value);
				}
				return;

			// Global search
			case 'search':
				this._searchAction(this.provider, value);
				return;

			// Search icons
			case 'filter':
				if (typeof value !== 'string') {
					return;
				}
				value = value.trim().toLowerCase();
				if (value === this.route.params.filter) {
					return;
				}
				this.route.params.filter = value as string;
				this.blocksRequireUpdate = true;
				break;

			// Change current page
			case 'pagination':
				if (typeof value === 'string') {
					value = parseInt(value);
				}

				// Check number
				if (
					typeof value !== 'number' ||
					isNaN(value) ||
					value < 0 ||
					value === this.route.params.page
				) {
					return;
				}

				// Change page
				this.route.params.page = value;
				this.blocksRequireUpdate = true;
				break;

			// Change reference icon
			case 'icons-nav':
				if (value === '' || value === null) {
					// Reset
					this.route.params.icon = '';
					break;
				}

				// Check type
				if (typeof value !== 'string') {
					return;
				}

				// Change reference icon and automatically set page
				this.route.params.icon = value;
				this.route.params.page = null;
				this.blocksRequireUpdate = true;
				break;

			// Filters
			case 'tags':
				this._filterAction('tag', value);
				return;

			case 'themePrefixes':
				this._filterAction('themePrefix', value);
				return;

			case 'themeSuffixes':
				this._filterAction('themeSuffix', value);
				return;

			// Parent view's filter
			case 'collections':
				this._collectionsAction(value);
				return;

			default:
				return;
		}

		// Action has changed something - trigger update event
		this._triggerUpdated();
	}

	/**
	 * Filter action
	 */
	_filterAction(
		key: keyof PartialCollectionRouteFilterParams,
		value: unknown
	): void {
		if (value !== null && typeof value !== 'string') {
			return;
		}

		if (this.route.params[key] === value) {
			return;
		}
		this.route.params[key] = value;
		this.blocksRequireUpdate = true;
		this._triggerUpdated();
	}

	/**
	 * Change active collection
	 */
	_collectionsAction(value: unknown): void {
		if (
			this.parent === null ||
			(this.parent.type !== 'search' &&
				this.parent.type !== 'collections')
		) {
			return;
		}

		// If value matches this collection, navigate to parent view
		if (value === this.prefix || value === null) {
			this._parentAction(1);
			return;
		}

		// Run action on parent view
		if (typeof value === 'string') {
			(this.parent as SearchView).action('collections-internal', value);
		}
	}

	/**
	 * Find icon in icons list
	 *
	 * Returns false on failure
	 */
	_getIconIndex(icons: Icon[], name: string): number | false {
		for (let i = 0; i < icons.length; i++) {
			const icon = icons[i];
			if (icon.name === name) {
				return i;
			}
			if (icon.aliases) {
				const aliases = icon.aliases;
				for (let j = 0; j < aliases.length; j++) {
					if (aliases[j] === name) {
						return i;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Render blocks
	 */
	render(): CollectionViewBlocks | null {
		if (this.loading || this._blocks === null || this._data === null) {
			return null;
		}

		// Check if blocks have been cached or if there is a error
		if (!this.blocksRequireUpdate || this.error !== '') {
			return this._blocks;
		}
		this.blocksRequireUpdate = false;

		// Apply route to blocks
		const blocks = this._blocks;

		// Copy icons
		blocks.icons.icons = this._data.icons.slice(0);

		// Set active filters
		blocks.filter.keyword = this.route.params.filter;
		if (blocks.tags !== null) {
			blocks.tags.active = this.route.params.tag;
		}
		if (blocks.themePrefixes !== null) {
			blocks.themePrefixes.active = this.route.params.themePrefix;
		}
		if (blocks.themeSuffixes !== null) {
			blocks.themeSuffixes.active = this.route.params.themeSuffix;
		}

		// Find reference icon
		let iconsList = blocks.icons.icons;
		const icon = this.route.params.icon;
		let iconIndex =
			icon === '' ? false : this._getIconIndex(iconsList, icon);
		if (iconIndex !== false) {
			// Get previous/next icons
			const max = iconsList.length - 1;
			blocks['icons-nav'] = {
				type: 'icons-nav',
				first: iconsList[0],
				last: iconsList[max],
				reference: iconsList[iconIndex],
				prev: iconIndex > 0 ? iconsList[iconIndex - 1] : void 0,
				next: iconIndex < max ? iconsList[iconIndex + 1] : void 0,
			};
		} else if (
			icon !== '' &&
			this._data.hidden &&
			this._data.hidden.indexOf(icon) !== -1
		) {
			// Icon exists, but it is hidden. Show first and last icons, indicating that reference icon exists
			blocks['icons-nav'] = {
				type: 'icons-nav',
				first: iconsList[0],
				last: iconsList[iconsList.length - 1],
				reference: {
					provider: this.provider,
					prefix: this.prefix,
					name: icon,
				},
			};
		} else {
			blocks['icons-nav'] = null;
		}

		// Apply search
		blocks.icons = applyIconFilters(
			blocks.icons,
			blocks.filter,
			filterKeys
				.filter((key) => blocks[key] !== null)
				.map((key) => blocks[key]) as FiltersBlock[]
		);
		iconsList = blocks.icons.icons;

		// Get current page
		const perPage = blocks.pagination.perPage;
		let page: number;
		if (this.route.params.page !== null) {
			page = this.route.params.page;
		} else if (icon === '') {
			page = 0;
		} else {
			if (iconsList.length !== this._data.icons.length) {
				// Update iconIndex
				iconIndex = this._getIconIndex(iconsList, icon);
			}
			page =
				iconIndex === false ? 0 : getPageForIndex(perPage, iconIndex);
		}

		// Check pagination
		blocks.pagination.length = blocks.icons.icons.length;
		blocks.pagination.page = page;
		const maximumPage = maxPage(blocks.pagination);
		if (maximumPage < blocks.pagination.page) {
			this.route.params.page = blocks.pagination.page = maximumPage;
		}

		// Apply pagination
		const startIndex = blocks.pagination.page * perPage;
		blocks.icons.icons = iconsList.slice(startIndex, startIndex + perPage);

		return this._blocks;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	_parseAPIData(data: unknown): void {
		if (!this._data && !this._isCustom) {
			this._data = dataToCollection(this.provider, data);
		}

		// Mark as loaded, mark blocks for re-render and reset error
		this.loading = false;
		this.blocksRequireUpdate = true;
		this.error = '';

		// Create empty blocks
		this._blocks = {
			// Info
			'info': defaultCollectionInfoBlock(),

			// Search
			'filter': Object.assign(defaultSearchBlock(), {
				keyword: this.route.params.filter,
				searchType: 'collection',
				title: this.prefix,
			}),

			// Filters
			'collections': null,
			'tags': null,
			'themePrefixes': null,
			'themeSuffixes': null,

			// Icons and pagination
			'icons': defaultIconsListBlock(),
			'pagination': defaultPaginationBlock(),
			'icons-nav': null,
		};
		const initialisedBlocks = this._blocks;

		// Check if data was valid
		if (this._data === null) {
			this.error = data === null ? 'not_found' : 'invalid_data';
			this._triggerLoaded();
			return;
		}
		const parsedData = this._data;

		// Validate prefix
		if (this.prefix !== parsedData.prefix) {
			this.error = 'invalid_data';
			this._triggerLoaded();
			return;
		}

		// Get registry and modules
		const registry = getRegistry(this._instance);
		const config = registry.config;
		const collections = registry.collections;

		// Set info
		initialisedBlocks.info.prefix = this.prefix;
		if (parsedData.info !== void 0) {
			// Store info in collections storage
			setCollectionInfo(
				collections,
				this.provider,
				this.prefix,
				parsedData.info
			);
		}

		// Get info from collections storage because it might include index for color scheme
		initialisedBlocks.info.info = getCollectionInfo(
			collections,
			this.provider,
			this.prefix
		);
		if (initialisedBlocks.info.info !== null) {
			initialisedBlocks.filter.title = initialisedBlocks.info.info.name;
		}

		// Check if there are any icons
		if (parsedData.total < 1) {
			this.error = 'empty';
		} else {
			// Create pagination
			const pagination = initialisedBlocks.pagination;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			pagination.perPage = config.ui!.itemsPerPage!;
			pagination.fullLength = pagination.length = parsedData.icons.length;
			const page = this.route.params.page;
			pagination.page =
				page === null ? 0 : Math.min(page, maxPage(pagination));

			// Copy collections filter from parent view
			if (this.parent && !this.parent.loading) {
				if (this.parent.type === 'search') {
					// Get copy of block from parent view
					const collectionsBlock = (this
						.parent as SearchView).getCollectionsBlock();
					if (collectionsBlock !== null) {
						// Copy block and set active filter
						this._blocks.collections = collectionsBlock;
						this._blocks.collections.active = this.prefix;
					}
				} else if (this.parent.type === 'collections') {
					// Find previous / next items
					this._blocks.collections = this._findSiblingCollections();
				}
			}

			// Icon filters
			let startIndex = 0;
			filterKeys.forEach((key) => {
				const dataKey = key as keyof CollectionData;
				if (parsedData[dataKey] !== void 0) {
					const list = parsedData[dataKey] as string[];
					if (list instanceof Array && list.length > 1) {
						// Create empty filters block
						const filter = defaultFiltersBlock();
						filter.filterType = key;
						initialisedBlocks[key] = filter;

						// Copy all filters
						list.forEach((tag) => {
							filter.filters[tag] = defaultFilter(tag);
						});

						// Apply index
						startIndex = autoIndexFilters(filter, startIndex);
					}
				}
			});
		}

		// Send event
		this._triggerLoaded();
	}

	/**
	 * Find sibling collections from collections list, return them as block
	 */
	_findSiblingCollections(): FiltersBlock | null {
		const collectionsBlock = (this
			.parent as CollectionsView).getCollectionsBlock();

		if (collectionsBlock === null) {
			return null;
		}

		const collections = collectionsPrefixesWithInfo(collectionsBlock);
		const match = collections.find((item) => item.prefix === this.prefix);
		if (match === void 0 || collections.length < 2) {
			return null;
		}

		// Get limit
		const registry = getRegistry(this._instance);
		const config = registry.config;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const limit = config.ui!.showSiblingCollections!;

		// Get items before and after current prefix
		let display: CollectionInfo[] = [];
		if (collections.length < limit * 2 + 2) {
			// Display all collections
			display = collections.slice(0);
		} else {
			const index = collections.indexOf(match);

			// few items before current
			for (let i = index - limit; i < index; i++) {
				display.push(
					collections[(i + collections.length) % collections.length]
				);
			}

			// Current item
			display.push(match);

			// few items after current
			for (let i = index + 1; i <= index + limit; i++) {
				display.push(collections[i % collections.length]);
			}
		}

		// Create block
		const block = defaultFiltersBlock();
		block.filterType = 'collections';
		block.active = this.prefix;

		display.forEach((item) => {
			const filter = defaultFilter(item.name);
			filter.index = item.index;
			block.filters[item.prefix] = filter;
		});

		return block;
	}
}
