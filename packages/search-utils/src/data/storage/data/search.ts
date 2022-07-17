import type {
	StoredIconFinderSearchQuery,
	StoredIconFinderSearchResults,
} from '../types/search';
import type { IconFinderStorage } from '../types/storage';

/**
 * Search results storage
 */
export const searchResultsStorage: IconFinderStorage<
	StoredIconFinderSearchResults,
	StoredIconFinderSearchQuery
> = {
	/**
	 * Prefix for events
	 */
	eventPrefix: 'search-',

	/**
	 * Key
	 */
	key: (query) =>
		[
			query.provider,
			query.keyword,
			query.limit,
			query.category,
			query.prefixes?.join(','),
		].join(':'),

	/**
	 * Data
	 */
	storage: new Map(),
};
