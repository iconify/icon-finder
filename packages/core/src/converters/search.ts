import { stringToIcon, validateIcon, Icon } from '../icon';
import { CollectionInfo, dataToCollectionInfo } from './collection';

/**
 * Search results
 */
export interface SearchResults {
	// Query
	query: string;

	// Numbers
	total: number;
	limit: number;

	// List of icons
	icons: Icon[];

	// List of used collections
	collections: {
		[index: string]: CollectionInfo;
	};
}

export function dataToSearchResults(data: unknown): SearchResults | null {
	if (typeof data !== 'object' || data === null) {
		return null;
	}

	// Get source as object
	const source = data as Record<string, unknown>;
	if (typeof source.request !== 'object' || source.request === null) {
		return null;
	}

	// Check required attributes
	const request = source.request as Record<string, string | number>;
	if (typeof request.query !== 'string') {
		return null;
	}
	if (typeof source.total !== 'number' || typeof source.limit !== 'number') {
		return null;
	}

	// Create result
	const result: SearchResults = {
		query: request.query,
		total: source.total,
		limit: source.limit,
		icons: [],
		collections: Object.create(null),
	};

	// Parse all icons
	if (
		typeof source.collections !== 'object' ||
		!(source.icons instanceof Array)
	) {
		return null;
	}

	const sourceIcons = source.icons as string[];
	const sourceCollections = source.collections as Record<string, unknown>;
	try {
		sourceIcons.forEach(item => {
			const icon = stringToIcon(item) as NonNullable<Icon>;
			if (!validateIcon(icon)) {
				throw new Error('Invalid icon');
			}
			result.icons.push(icon);

			const prefix = icon.prefix;
			if (result.collections[prefix] === void 0) {
				// Add collection
				if (sourceCollections[prefix] === void 0) {
					throw new Error(`Missing data for prefix ${prefix}`);
				}

				const info = dataToCollectionInfo(
					sourceCollections[prefix],
					prefix
				);
				if (info === null) {
					throw new Error(`Invalid data for prefix ${prefix}`);
				}

				result.collections[prefix] = info;
			}
		});
	} catch (err) {
		return null;
	}

	// Overwrite total
	result.total = result.icons.length;

	return result;
}
