import type { BaseViewBlocks } from './base';
import { BaseView } from './base';
import type { FiltersBlock } from '../blocks/filters';
import {
	defaultFiltersBlock,
	defaultFilter,
	autoIndexFilters,
} from '../blocks/filters';
import type { FullSearchRoute } from '../route/types/routes';
import type { SearchResults } from '../converters/search';
import { dataToSearchResults } from '../converters/search';
import { IconsListBlock, defaultIconsListBlock } from '../blocks/icons-list';
import type { PaginationBlock } from '../blocks/pagination';
import { defaultPaginationBlock, maxPage } from '../blocks/pagination';
import { getRegistry } from '../registry/storage';
import type { View } from './types';
import { cloneObject } from '../misc/objects';
import { setCollectionInfo } from '../data/collections';
import { searchCacheKey } from '../api/base';

/**
 * Blocks
 */
export interface SearchViewBlocks extends BaseViewBlocks {
	// Filter
	collections: FiltersBlock | null;

	// Icons and pagination
	icons: IconsListBlock;
	pagination: PaginationBlock;
}

/**
 * Class
 */
export class SearchView extends BaseView {
	public readonly provider: string;
	public readonly route: FullSearchRoute;
	protected _data: SearchResults | null = null;
	protected _blocks: SearchViewBlocks | null = null;

	// Copy of route and config variables for faster access and to make sure they do not change
	public readonly keyword: string;
	public readonly itemsPerPage: number;
	public itemsLimit: number;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: FullSearchRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'search';
		this._instance = instance;
		this.route = route;
		this.provider = route.params.provider;
		this.parent = parent;
		this.keyword = route.params.search;

		// Get number of items per page
		const registry = getRegistry(this._instance);
		const config = registry.config;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		this.itemsPerPage = config.ui!.itemsPerPage!;

		// Check if full results need to be shown
		if (this.route.params.page > 1) {
			this.route.params.short = false;
		}

		// Set items limit for query
		this.itemsLimit = this.route.params.short ? this.itemsPerPage * 2 : 999;
	}

	/**
	 * Start loading
	 */
	_startLoadingData(): void {
		const query = this.keyword;
		const limit = this.itemsLimit;
		this._loadAPI(
			this.provider,
			'/search',
			{
				query,
				limit,
			},
			searchCacheKey(query, limit)
		);
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		switch (action) {
			// Change to parent view
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
				if (typeof value !== 'string') {
					return;
				}
				value = value.trim().toLowerCase();
				if (value === this.keyword) {
					return;
				}
				this._searchAction(this.provider, value);
				return;

			// Change current page
			case 'pagination':
				if (value === 'more' && this._showMoreButton()) {
					// Change to current page + 1
					value = this.route.params.page + 1;
				}

				// Check number
				if (typeof value === 'string') {
					value = parseInt(value);
				}
				if (
					typeof value !== 'number' ||
					isNaN(value) ||
					value === this.route.params.page ||
					value < 0
				) {
					return;
				}

				// Check for "more"
				if (value > 0 && this._showMoreButton()) {
					// Create sibling route
					this._triggerFullResults(value);
					return;
				}

				this.route.params.page = value;
				this.blocksRequireUpdate = true;
				break;

			// Collections filter
			case 'collections':
				this._collectionsAction(value, 0);
				return;

			// Collections filter, called from child view
			case 'collections-internal':
				this._collectionsAction(value, 1);
				return;

			default:
				return;
		}

		// Action has changed something - trigger update event
		this._triggerUpdated();
	}

	/**
	 * Change active collection
	 */
	_collectionsAction(value: unknown, levels: number): void {
		if (value !== null && typeof value !== 'string') {
			return;
		}
		if (
			this.loading ||
			this._blocks === null ||
			this._blocks.collections === null
		) {
			return;
		}

		const registry = getRegistry(this._instance);
		const router = registry.router;
		if (value === null) {
			// Change view to search results
			router.setParentView(levels);
			return;
		}

		// Create child view
		const prefix = value as string;
		router.createChildView(
			{
				type: 'collection',
				params: {
					provider: this.provider,
					prefix,
					filter: this.keyword,
				},
			},
			levels
		);
	}

	/**
	 * Show full results
	 */
	_triggerFullResults(page: number): void {
		// Create sibling view
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.createChildView(
			{
				type: 'search',
				params: Object.assign({}, this.route.params, {
					page: page,
					short: false,
				}),
			},
			1
		);
	}

	/**
	 * Render blocks
	 */
	render(): SearchViewBlocks | null {
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
		if (blocks.collections !== null) {
			blocks.collections.active = null;
		}

		// Check pagination
		blocks.pagination.length = blocks.icons.icons.length;
		blocks.pagination.page = this.route.params.page;
		const maximumPage = maxPage(blocks.pagination);
		if (maximumPage < blocks.pagination.page) {
			this.route.params.page = blocks.pagination.page = maximumPage;
		}

		// Apply pagination
		const startIndex = blocks.pagination.page * this.itemsPerPage;
		blocks.icons.icons = blocks.icons.icons.slice(
			startIndex,
			startIndex + this.itemsPerPage
		);

		return this._blocks;
	}

	/**
	 * Get collections block.
	 *
	 * Used by child views. Result is copied, ready to be modified
	 */
	getCollectionsBlock(): FiltersBlock | null {
		if (this.loading || this.error !== '') {
			return null;
		}
		const blocks = this.render();
		return blocks !== null && blocks.collections !== null
			? (cloneObject(blocks.collections) as FiltersBlock)
			: null;
	}

	/**
	 * Check if more results are available
	 */
	_showMoreButton(): boolean {
		return this._data === null
			? false
			: this.route.params.short && this._data.total === this._data.limit;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	_parseAPIData(data: unknown): void {
		this._data = dataToSearchResults(this.provider, data);

		// Mark as loaded, mark blocks for re-render and reset error
		this.loading = false;
		this.blocksRequireUpdate = true;
		this.error = '';

		// Create empty blocks
		this._blocks = {
			// Filters
			collections: null,

			// Icons and pagination
			icons: defaultIconsListBlock(),
			pagination: defaultPaginationBlock(),
		};
		const initialisedBlocks = this._blocks;

		// Check if data was valid
		if (this._data === null) {
			this.error = data === null ? 'not_found' : 'invalid_data';
			this._triggerLoaded();
			return;
		}
		const parsedData = this._data;

		// Validate parameters
		if (this.keyword !== parsedData.query) {
			this.error = 'invalid_data';
			this._triggerLoaded();
			return;
		}

		// Overwrite limit
		if (parsedData.limit) {
			this.itemsLimit = parsedData.limit;
		}

		// Check if there are any icons
		if (parsedData.total < 1) {
			this.error = 'empty';
		} else {
			// Create pagination
			const pagination = initialisedBlocks.pagination;
			pagination.perPage = this.itemsPerPage;
			pagination.fullLength = pagination.length = parsedData.icons.length;
			pagination.page = Math.min(
				this.route.params.page,
				maxPage(pagination)
			);

			// Check if more results are available
			pagination.more = this._showMoreButton();

			// Get all collections
			const prefixes = Object.keys(parsedData.collections);

			// Store collections in global data
			const registry = getRegistry(this._instance);
			const collections = registry.collections;
			prefixes.forEach((prefix) => {
				setCollectionInfo(
					collections,
					this.provider,
					prefix,
					parsedData.collections[prefix]
				);
			});

			// Collections filter
			if (prefixes.length > 1) {
				const block = defaultFiltersBlock();
				this._blocks.collections = block;
				block.filterType = 'collections';

				prefixes.forEach((prefix) => {
					block.filters[prefix] = defaultFilter(
						parsedData.collections[prefix].name
					);
				});

				autoIndexFilters(block);
			}
		}

		// Send event
		this._triggerLoaded();
	}
}
