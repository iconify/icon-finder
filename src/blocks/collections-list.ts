import type { BaseBlock } from './types';
import type {
	CollectionsList,
	CollectionsListFilterCallback,
} from '../converters/collections';
import {
	collectionsPrefixes,
	filterCollections,
} from '../converters/collections';
import type { CollectionInfo } from '../converters/collection';
import type { FiltersBlock } from './filters';
import { enableFilters } from './filters';
import type { CollectionsFilterBlock } from './collections-filter';
import { match } from '../objects';

/**
 * Block
 */
export interface CollectionsListBlock extends BaseBlock {
	readonly type: 'collections-list';
	showCategories: boolean;
	collections: CollectionsList;
}

/**
 * Default values
 */
export const defaultCollectionsListBlock = (): CollectionsListBlock => {
	return {
		type: 'collections-list',
		showCategories: true,
		collections: Object.create(null),
	};
};

/**
 * Check if block is empty
 */
export function isCollectionsBlockEmpty(
	block?: CollectionsListBlock | null
): boolean {
	if (block === void 0 || block === null) {
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
			(category) => Object.keys(block.collections[category]).length > 0
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
 * Get all collections info as array
 */
export function collectionsPrefixesWithInfo(
	block: CollectionsListBlock
): CollectionInfo[] {
	const info: CollectionInfo[] = [];
	Object.keys(block.collections).forEach((category) => {
		const items = block.collections[category];
		Object.keys(items).forEach((prefix) => {
			if (items[prefix] !== null) {
				info.push(items[prefix]);
			}
		});
	});
	return info;
}

/**
 * Iterate collections block
 */
export function iterateCollectionsBlock(
	block: CollectionsListBlock,
	callback: (data: CollectionInfo, prefix: string, category: string) => void
): void {
	Object.keys(block.collections).forEach((category) => {
		const items = block.collections[category];
		Object.keys(items).forEach((prefix) => {
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
		type: 'collections-list',
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
		type: 'collections-list',
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
	const hasFilters = filters !== null && filters.filterType === 'categories';
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

				// Test value
				if (match(item[key], keyword)) {
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
		false
	);
}
