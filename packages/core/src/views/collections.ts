import { BaseView, BaseViewBlocks } from './base';
import {
	CollectionsFilterBlock,
	defaultCollectionsFilterBlock,
} from '../blocks/collections-filter';
import {
	CollectionsListBlock,
	defaultCollectionsListBlock,
	getCollectionsBlockCategories,
	disableInactiveCategories,
	applyCollectionsFilter,
	iterateCollectionsBlock,
} from '../blocks/collections-list';
import {
	FiltersBlock,
	defaultFiltersBlock,
	defaultFilter,
	autoIndexFilters,
} from '../blocks/filters';
import { CollectionsRoute, PartialRoute } from '../route/types';
import {
	CollectionsList,
	dataToCollections,
	autoIndexCollections,
	CollectionsListRawData,
} from '../converters/collections';
import { getRegistry } from '../registry/storage';
import { View } from './types';
import { setCollectionInfo } from '../data/collections';
import { IconFinderCustomSetsMerge } from '../data/custom-sets';

/**
 * Blocks
 */
export interface CollectionsViewBlocks extends BaseViewBlocks {
	filter: CollectionsFilterBlock;
	categories: FiltersBlock;
	collections: CollectionsListBlock;
}

// Source
interface CollectionsSources {
	api: boolean;
	custom: boolean;
	merge?: IconFinderCustomSetsMerge;
}

/**
 * Class
 */
export class CollectionsView extends BaseView {
	public readonly provider: string;
	public readonly route: CollectionsRoute;

	protected _data: CollectionsList | null = null;
	protected _blocks: CollectionsViewBlocks | null = null;
	protected readonly _sources: CollectionsSources;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: CollectionsRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'collections';
		this._instance = instance;
		this.route = route;
		this.provider = route.params.provider;
		this.parent = parent;

		// Check if custom icon set is used
		const registry = getRegistry(this._instance);
		const customSets = registry.customIconSets;
		if (customSets.providers[this.provider] !== void 0) {
			this._sources = {
				custom: true,
				api: customSets.merge !== 'only-custom',
				merge: customSets.merge,
			};
		} else {
			this._sources = {
				custom: false,
				api: true,
			};
		}
	}

	/**
	 * Start loading
	 */
	_startLoading(): void {
		this._startedLoading = true;

		if (!this._sources.api) {
			setTimeout(() => {
				this._parseAPIData(null);
			});
			return;
		}

		this._loadAPI(this.provider, '/collections', {});
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		switch (action) {
			// Parent view
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
				if (this._sources.api) {
					this._searchAction(this.provider, value);
				}
				return;

			// Filter collections
			case 'filter':
				if (typeof value !== 'string') {
					return;
				}
				value = value.trim().toLowerCase();
				if (this.route.params.filter !== value) {
					this.route.params.filter = value as string;
					this.blocksRequireUpdate = true;
				} else {
					return;
				}
				break;

			// Filter categories
			case 'categories':
				if (
					(value === null || typeof value === 'string') &&
					value !== this.route.params.category
				) {
					this.route.params.category = value;
					this.blocksRequireUpdate = true;
				} else {
					return;
				}
				break;

			// Select collection, called from child view
			case 'collections-internal':
				if (typeof value !== 'string' || value === '') {
					return;
				}
				this._triggerCollectionAction(value, 1);
				return;

			// Select collection
			case 'collections':
				if (typeof value !== 'string' || value === '') {
					return;
				}
				this._triggerCollectionAction(value, 0);
				return;

			default:
				return;
		}

		// Action has changed something - trigger update event
		this._triggerUpdated();
	}

	/**
	 * Create child view for prefix
	 */
	_triggerCollectionAction(prefix: string, levels: number): void {
		// Try to find prefix in collections list
		if (!this.loading && this._data !== null && this.error === '') {
			// Find matching prefix
			const categories = Object.keys(this._data);
			let found = false;

			for (let i = 0; i < categories.length; i++) {
				if (this._data[categories[i]][prefix] !== void 0) {
					found = true;
					break;
				}
			}

			if (!found) {
				return;
			}
		}

		// Create child view
		const registry = getRegistry(this._instance);
		const router = registry.router;
		router.createChildView(
			{
				type: 'collection',
				params: {
					provider: this.provider,
					prefix: prefix,
				},
			} as PartialRoute,
			levels
		);
	}

	/**
	 * Render blocks
	 */
	render(): CollectionsViewBlocks | null {
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
		const keyword =
			typeof this.route.params.filter === 'string'
				? this.route.params.filter
				: '';
		const category =
			typeof this.route.params.category === 'string'
				? this.route.params.category
				: null;

		// Set keyword and active category
		blocks.filter.keyword = keyword;
		blocks.categories.active = category;

		// Set collections
		blocks.collections.collections = this._data;

		// Apply search filter and change disabled categories in categories filter
		blocks.collections = applyCollectionsFilter(
			blocks.collections,
			blocks.filter,
			blocks.categories
		);

		// Apply category filter
		if (category !== null) {
			blocks.collections = disableInactiveCategories(
				blocks.collections,
				category
			);
		}

		return blocks;
	}

	/**
	 * Get collections block.
	 *
	 * Used by child view.
	 */
	getCollectionsBlock(): CollectionsListBlock | null {
		if (this.loading || this.error !== '') {
			return null;
		}
		const blocks = this.render();
		return blocks !== null && blocks.collections !== null
			? blocks.collections
			: null;
	}

	/**
	 * Parse data from API
	 *
	 * Should be overwritten by child classes
	 */
	_parseAPIData(data: unknown): void {
		if (this._sources.api && !data) {
			// Error
			this._data = null;
		} else {
			interface ParsedList {
				isCustom: boolean;
				categories: CollectionsList;
			}

			// Get list of parsed data
			const parsedData: ParsedList[] = [];
			if (this._sources.api) {
				parsedData.push({
					isCustom: false,
					categories: dataToCollections(
						data as CollectionsListRawData
					),
				});
			}
			if (this._sources.custom) {
				// Get data
				const registry = getRegistry(this._instance);
				const customSets = registry.customIconSets;
				const customCollections =
					customSets.providers[this.route.params.provider]
						.collections;

				// Unshift or push it, depending on merge order
				parsedData[
					this._sources.merge === 'custom-first' ? 'unshift' : 'push'
				]({
					isCustom: true,
					categories: customCollections,
				});
			}

			// Setup result as empty object
			this._data = Object.create(null) as CollectionsList;
			const dataItem = this._data;

			// Store prefixes map to avoid duplicates
			const usedPrefixes: Record<string, string> = Object.create(null);

			// Parse all data
			parsedData.forEach((item) => {
				// Parse all categories
				const collectionsList = item.categories;
				Object.keys(collectionsList).forEach((category) => {
					const categoryItems = collectionsList[category];
					Object.keys(categoryItems).forEach((prefix) => {
						if (usedPrefixes[prefix] !== void 0) {
							// Prefix has already been parsed
							if (item.isCustom) {
								// Remove previous entry
								delete dataItem[usedPrefixes[prefix]][prefix];
							} else {
								// Do not overwrite: always show set from API in case of duplicate entries
								return;
							}
						}

						// Add item
						usedPrefixes[prefix] = category;
						if (dataItem[category] === void 0) {
							dataItem[category] = Object.create(null);
						}
						dataItem[category][prefix] = categoryItems[prefix];
					});
				});
			});
		}

		// Mark as loaded and mark blocks for re-render
		this.loading = false;
		this.blocksRequireUpdate = true;
		this.error = '';

		// Create blocks
		this._blocks = {
			filter: defaultCollectionsFilterBlock(),
			categories: defaultFiltersBlock(),
			collections: defaultCollectionsListBlock(),
		};
		this._blocks.categories.filterType = 'categories';

		// Parse data
		if (this._data === null) {
			this.error = data === null ? 'not_found' : 'invalid_data';
		} else {
			// Add indexes to collections
			autoIndexCollections(this._data);

			// Set collections
			this._blocks.collections.collections = this._data;

			// Get categories
			const categories = getCollectionsBlockCategories(
				this._blocks.collections,
				true
			);

			if (categories.length === 0) {
				this.error = 'empty';
			} else {
				if (categories.length > 1) {
					// Set category filters
					this._blocks.collections.showCategories = true;
					const filters = this._blocks.categories.filters;
					categories.forEach((category) => {
						filters[category] = defaultFilter(category);
					});
					autoIndexFilters(this._blocks.categories);
				} else {
					// Disable category filters
					this._blocks.collections.showCategories = false;
				}

				// Store collections in global data
				const registry = getRegistry(this._instance);
				const collections = registry.collections;
				iterateCollectionsBlock(
					this._blocks.collections,
					(item, prefix) => {
						setCollectionInfo(
							collections,
							this.provider,
							prefix,
							item
						);
					}
				);
			}
		}

		// Send event
		this._triggerLoaded();
	}
}
