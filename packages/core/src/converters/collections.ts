import { dataToCollectionInfo, CollectionInfo } from './collection';

/**
 * List of collections, sorted by category and by prefix
 */
export interface CollectionsList {
	[index: string]: {
		[index: string]: CollectionInfo;
	};
}

/**
 * Callback for filtering collections list
 */
export interface CollectionsListFilterCallback {
	(item: CollectionInfo, category: string, prefix: string): boolean;
}

/**
 * Convert data from API to CollectionsList
 */
export function dataToCollections(data: unknown): CollectionsList {
	const result = Object.create(null);
	const uncategorised = Object.create(null);

	if (typeof data !== 'object' || data === null) {
		return result;
	}

	// Assume Record<prefix, item> structure
	Object.keys(data).forEach(prefix => {
		const row = (data as Record<string, unknown>)[prefix] as Record<
			string,
			unknown
		>;
		if (
			typeof row !== 'object' ||
			row === null ||
			typeof row.category !== 'string'
		) {
			return;
		}

		// Convert item
		const item = dataToCollectionInfo(row, prefix);
		if (item === null) {
			return;
		}

		// Add category and item
		const category = row.category;
		if (category !== '') {
			if (result[category] === void 0) {
				result[category] = Object.create(null);
			}
			result[category][prefix] = item;
		} else {
			uncategorised[prefix] = item;
		}
	});

	// Add uncategorised at the end
	if (Object.keys(uncategorised).length > 0) {
		result[''] = uncategorised;
	}

	return result;
}

/**
 * Get collection prefixes from converted collections list
 */
export function collectionsPrefixes(collections: CollectionsList): string[] {
	let prefixes: string[] = [];
	Object.keys(collections).forEach(category => {
		prefixes = prefixes.concat(Object.keys(collections[category]));
	});
	return prefixes;
}

/**
 * Filter collections
 */
export function filterCollections(
	collections: CollectionsList,
	callback: CollectionsListFilterCallback,
	keepEmptyCategories = false
): CollectionsList {
	const result = Object.create(null);

	// Parse each category
	Object.keys(collections).forEach(category => {
		if (keepEmptyCategories) {
			result[category] = Object.create(null);
		}

		// Parse each item in category
		Object.keys(collections[category]).forEach(prefix => {
			const item = collections[category][prefix];

			if (!callback(item, category, prefix)) {
				return;
			}

			// Passed filter
			if (result[category] === void 0) {
				result[category] = Object.create(null);
			}
			result[category][prefix] = item;
		});
	});

	return result;
}

/**
 * Add indexes to all collections
 */
export function autoIndexCollections(
	collections: CollectionsList,
	start = 0
): void {
	let index = start;

	Object.keys(collections).forEach(category => {
		const items = collections[category];
		Object.keys(items).forEach(prefix => {
			items[prefix].index = index++;
		});
	});
}
