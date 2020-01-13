import {
	CollectionsList,
	collectionsPrefixes,
	CollectionsListFilterCallback,
	filterCollections,
} from '../converters/collections';
import { CollectionInfo } from '../converters/collection';
import { FiltersBlock, enableFilters } from './filters';
import { CollectionsFilterBlock } from './collections-filter';

/**
 * Block
 */
export interface CollectionsListBlock {
	showCategories: boolean;
	collections: CollectionsList;
}

/**
 * Default values
 */
export const defaultCollectionsListBlock = (): CollectionsListBlock => {
	return {
		showCategories: true,
		collections: Object.create(null),
	};
};

/**
 * Check if block is empty
 */
export function isCollectionsBlockEmpty(
	block: CollectionsListBlock | null
): boolean {
	if (block === null) {
		return true;
	}

	const categories = Object.keys(block.collections);

	for (let i = 0; i < categories.length; i++) {
		if (Object.keys(block.collections[categories[i]]).length > 0) {
			return false;
		}
	}

	return true;
}

/**
 * Get categories
 */
export function getCollectionsBlockCategories(
	block: CollectionsListBlock,
	ignoreEmpty = false
): string[] {
	let categories = Object.keys(block.collections);
	if (ignoreEmpty) {
		categories = categories.filter(
			category => Object.keys(block.collections[category]).length > 0
		);
	}
	return categories;
}

/**
 * Get all prefixes
 */
export function getCollectionsBlockPrefixes(
	block: CollectionsListBlock
): string[] {
	return collectionsPrefixes(block.collections);
}

/**
 * Iterate collections block
 */
export function iterateCollectionsBlock(
	block: CollectionsListBlock,
	callback: (data: CollectionInfo, prefix: string, category: string) => void
): void {
	Object.keys(block.collections).forEach(category => {
		const items = block.collections[category];
		Object.keys(items).forEach(prefix => {
			callback(items[prefix], prefix, category);
		});
	});
}

/**
 * Filter collections list (creates new block)
 */
export function filterCollectionsBlock(
	block: CollectionsListBlock,
	callback: CollectionsListFilterCallback,
	keepEmptyCategories = false
): CollectionsListBlock {
	const result: CollectionsListBlock = {
		showCategories: block.showCategories,
		collections: filterCollections(
			block.collections,
			callback,
			keepEmptyCategories
		),
	};
	return result;
}

/**
 * Remove all inactive categories
 */
export function disableInactiveCategories(
	block: CollectionsListBlock,
	category: string | null
): CollectionsListBlock {
	if (category === null) {
		return block;
	}

	const result: CollectionsListBlock = {
		showCategories: block.showCategories,
		collections: Object.create(null),
	};
	if (block.collections[category] !== void 0) {
		result.collections[category] = block.collections[category];
	}

	return result;
}

/**
 * List of keys to apply filter to
 */
const filterKeys: (keyof CollectionInfo)[] = [
	'prefix',
	'name',
	'author',
	'license',
	'category',
	'palette',
	'height',
];

/**
 * Apply filter to collections list and to collections filters
 */
export function applyCollectionsFilter(
	block: CollectionsListBlock,
	filter: CollectionsFilterBlock,
	filters: FiltersBlock | null
): CollectionsListBlock {
	const keyword = filter.keyword.trim();
	const hasFilters = filters !== null && filters.type === 'categories';
	const filtersList = filters as FiltersBlock;

	if (keyword === '') {
		// Empty
		if (hasFilters) {
			// Enable all filters
			enableFilters(filtersList, true);
		}
		return block;
	}

	// Disable all filters, will re-enable them again during filter process
	const activeCategories: Record<string, boolean> = {};
	if (hasFilters) {
		enableFilters(filtersList, false);
	}

	// Filter collections block
	return filterCollectionsBlock(
		block,
		(item, category) => {
			for (let i = filterKeys.length - 1; i >= 0; i--) {
				// Get key
				const key = filterKeys[i];
				if (item[key] === void 0) {
					continue;
				}

				// Get value
				const value = item[key];
				const test = (typeof value === 'string'
					? value
					: JSON.stringify(value)
				).toLowerCase();

				// Test value
				if (test.indexOf(keyword) !== -1) {
					// Enable category in category filters
					if (hasFilters) {
						if (activeCategories[category] !== true) {
							activeCategories[category] = true;
							if (filtersList.filters[category] !== void 0) {
								filtersList.filters[category].disabled = false;
							}
						}
					}
					return true;
				}
			}
			return false;
		},
		true
	);
}
