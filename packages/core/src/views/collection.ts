import { BaseView, BaseViewBlocks } from './base';
import {
	CollectionInfoBlock,
	defaultCollectionInfoBlock,
} from '../blocks/collection-info';
import {
	FiltersBlock,
	defaultFiltersBlock,
	defaultFilter,
	autoIndexFilters,
} from '../blocks/filters';
import { CollectionRoute } from '../route/types';
import { dataToCollection, CollectionData } from '../converters/collection';
import {
	IconsListBlock,
	defaultIconsListBlock,
	applyIconFilters,
} from '../blocks/icons-list';
import {
	PaginationBlock,
	defaultPaginationBlock,
	maxPage,
} from '../blocks/pagination';
import { getRegistry } from '../registry';
import { SearchBlock, defaultSearchBlock } from '../blocks/search';
import { View } from './types';
import { CollectionRouteFilterParams } from '../route/params';
import { SearchView } from './search';

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
	info: CollectionInfoBlock;

	// Search
	filter: SearchBlock;

	// Filter from search block
	collections: FiltersBlock | null;

	// Icons and pagination
	icons: IconsListBlock;
	pagination: PaginationBlock;
}

/**
 * Class
 */
export class CollectionView extends BaseView {
	public readonly route: CollectionRoute;
	protected _data: CollectionData | null = null;
	protected _blocks: CollectionViewBlocks | null = null;

	// Copy of route variable for faster access and to make sure it does not change
	public readonly prefix: string;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: CollectionRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'collection';
		this._instance = instance;
		this.route = route;
		this.parent = parent;
		this.prefix = route.params.prefix;

		// Wait for parent to load if parent view is search
		this._mustWaitForParent = parent !== null && parent.type === 'search';
	}

	/**
	 * Start loading
	 */
	_startLoading(): void {
		this._startedLoading = true;
		this._loadAPI('/collection', {
			info: 'true',
			prefix: this.prefix,
		});
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

			// Global search
			case 'search':
				this._searchAction(value);
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
				this.route.params.page = value as number;
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
		key: keyof CollectionRouteFilterParams,
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
			this.parent.type !== 'search' ||
			typeof value !== 'string'
		) {
			return;
		}

		// If value matches this collection, navigate to parent view
		if (value === this.prefix || value === null) {
			this._parentAction(1);
			return;
		}

		// Run action on parent view
		(this.parent as SearchView).action('collections-internal', value);
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

		// Apply search
		blocks.icons = applyIconFilters(
			blocks.icons,
			blocks.filter,
			filterKeys
				.filter(key => blocks[key] !== null)
				.map(key => blocks[key]) as FiltersBlock[]
		);

		// Check pagination
		blocks.pagination.length = blocks.icons.icons.length;
		blocks.pagination.page = this.route.params.page;
		const maximumPage = maxPage(blocks.pagination);
		if (maximumPage < blocks.pagination.page) {
			this.route.params.page = blocks.pagination.page = maximumPage;
		}

		// Apply pagination
		const perPage = blocks.pagination.perPage;
		const startIndex = blocks.pagination.page * perPage;
		blocks.icons.icons = blocks.icons.icons.slice(
			startIndex,
			startIndex + perPage
		);

		return this._blocks;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	_parseAPIData(data: unknown): void {
		this._data = dataToCollection(data);

		// Mark as loaded, mark blocks for re-render and reset error
		this.loading = false;
		this.blocksRequireUpdate = true;
		this.error = '';

		// Create empty blocks
		this._blocks = {
			// Info
			info: defaultCollectionInfoBlock(),

			// Search
			filter: Object.assign(defaultSearchBlock(), {
				keyword: this.route.params.filter,
				searchType: 'collection',
				title: this.prefix,
			}),

			// Filters
			collections: null,
			tags: null,
			themePrefixes: null,
			themeSuffixes: null,

			// Icons and pagination
			icons: defaultIconsListBlock(),
			pagination: defaultPaginationBlock(),
		};
		const initialisedBlocks = this._blocks;

		// Check if data was valid
		if (this._data === null) {
			this.error = 'invalid_data';
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
			collections.set(this.prefix, parsedData.info);
		}

		// Get info from collections storage because it might include index for color scheme
		initialisedBlocks.info.info = collections.get(this.prefix);
		if (initialisedBlocks.info.info !== null) {
			initialisedBlocks.filter.title = initialisedBlocks.info.info.name;
		}

		// Check if there are any icons
		if (parsedData.total < 1) {
			this.error = 'empty';
		} else {
			// Create pagination
			const pagination = initialisedBlocks.pagination;
			pagination.perPage = config.data.display.itemsPerPage as number;
			pagination.length = parsedData.icons.length;
			pagination.page = Math.min(
				this.route.params.page,
				maxPage(pagination)
			);

			// Copy collections filter from parent view
			if (this.parent) {
				const parentView = this.parent as SearchView;
				if (parentView.type === 'search' && !parentView.loading) {
					// Get copy of block from parent view
					const collectionsBlock = parentView.getCollectionsBlock();
					if (collectionsBlock !== null) {
						// Copy block and set active filter
						this._blocks.collections = collectionsBlock;
						this._blocks.collections.active = this.prefix;
					}
				}
			}

			// Icon filters
			filterKeys.forEach(key => {
				const dataKey = key as keyof CollectionData;
				if (parsedData[dataKey] !== void 0) {
					const list = parsedData[dataKey] as string[];
					if (list instanceof Array && list.length > 1) {
						// Create empty filters block
						const filter = defaultFiltersBlock();
						filter.filterType = key;
						initialisedBlocks[key] = filter;

						// Copy all filters
						list.forEach(tag => {
							filter.filters[tag] = defaultFilter(tag);
						});

						// Apply index
						autoIndexFilters(filter);
					}
				}
			});
		}

		// Send event
		this._triggerLoaded();
	}
}
