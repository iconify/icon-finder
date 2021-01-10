import type { CollectionsList } from './collections';
import type { CollectionData } from './collection';
import type { SearchResults } from './search';

/**
 * Cache stored in 'core-cache' as Record<string, IconFinderConvertedCache>, where key is API provider.
 *
 * This is used to set cached data to render data without retrieving it from API.
 */
export interface IconFinderConvertedCache {
	// Collections list
	collections?: CollectionsList;

	// Collection data, stored by prefix
	collection?: Record<string, CollectionData>;

	// Only full search results should be cached
	search?: Record<string, SearchResults>;
}
