import type { IconifyInfo } from '@iconify/types';
import type { CollectionInfo, LegacyIconifyInfo } from './info';
import { dataToCollectionInfo } from './info';

/**
 * List of collections, sorted by category and by prefix
 */
export type VisibleCollectionsList = Record<
	string,
	Record<string, CollectionInfo>
>;
export type HiddenCollectionsList = Record<string, CollectionInfo>;
export interface ExtendedCollectionsList {
	visible: VisibleCollectionsList;
	hidden: HiddenCollectionsList;
}

/**
 * Callback for filtering collections list
 */
export interface CollectionsListFilterCallback {
	(item: CollectionInfo, category: string, prefix: string): boolean;
}

/**
 * Interface for data provided by API
 */
export type CollectionsListRawData = Record<
	string,
	Partial<IconifyInfo> | LegacyIconifyInfo
>;

/**
 * Convert data from API to CollectionsList
 */
export function dataToCollections(
	data: CollectionsListRawData
): ExtendedCollectionsList {
	const result: ExtendedCollectionsList = {
		visible: Object.create(null),
		hidden: Object.create(null),
	};
	const visible = result.visible;
	const uncategorised = Object.create(null);

	if (typeof data !== 'object' || data === null) {
		return result;
	}

	// Assume Record<prefix, item> structure
	Object.keys(data).forEach((prefix) => {
		const row = data[prefix];
		if (
			typeof row !== 'object' ||
			row === null ||
			typeof row.category !== 'string'
		) {
			return;
		}

		// Convert item
		const item = dataToCollectionInfo(row, prefix);
		if (!item) {
			return;
		}
		if (item.hidden) {
			result.hidden[prefix] = item;
			return;
		}

		// Add category and item
		const category = row.category;
		if (category !== '') {
			if (visible[category] === void 0) {
				visible[category] = Object.create(null);
			}
			visible[category][prefix] = item;
		} else {
			uncategorised[prefix] = item;
		}
	});

	// Add uncategorised at the end
	if (Object.keys(uncategorised).length > 0) {
		visible[''] = uncategorised;
	}

	return result;
}

/**
 * Get collection prefixes from converted collections list
 */
export function collectionsPrefixes(
	collections: ExtendedCollectionsList
): string[] {
	let prefixes: string[] = [];
	const visible = collections.visible;
	Object.keys(visible).forEach((category) => {
		prefixes = prefixes.concat(Object.keys(visible[category]));
	});
	return prefixes;
}

/**
 * Filter collections
 */
export function filterCollections(
	collections: ExtendedCollectionsList,
	callback: CollectionsListFilterCallback,
	keepEmptyCategories = false
): ExtendedCollectionsList {
	const result: ExtendedCollectionsList = {
		visible: Object.create(null),
		hidden: collections.hidden,
	};
	const visibleSource = collections.visible;
	const visibleResults = result.visible;

	// Parse each category
	Object.keys(visibleSource).forEach((category) => {
		if (keepEmptyCategories) {
			visibleResults[category] = Object.create(null);
		}

		// Parse each item in category
		Object.keys(visibleSource[category]).forEach((prefix) => {
			const item = visibleSource[category][prefix];

			if (!callback(item, category, prefix)) {
				return;
			}

			// Passed filter
			if (visibleResults[category] === void 0) {
				visibleResults[category] = Object.create(null);
			}
			visibleResults[category][prefix] = item;
		});
	});

	return result;
}

/**
 * Add indexes to all collections
 */
export function autoIndexCollections(
	collections: ExtendedCollectionsList,
	start = 0
): void {
	const visible = collections.visible;
	let index = start;

	Object.keys(visible).forEach((category) => {
		const items = visible[category];
		Object.keys(items).forEach((prefix) => {
			items[prefix].index = index++;
		});
	});
}
