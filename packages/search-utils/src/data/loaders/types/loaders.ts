import type {
	StoredIconFinderCollectionsList,
	StoredIconFinderCollectionsParams,
} from '../../collections/types/storage';
import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from '../../icon-set/types/storage';
import type {
	StoredIconFinderSearchQuery,
	StoredIconFinderSearchResults,
} from '../../search/types/storage';
import type { IconFinderStorageLoader } from '../../storage/types/storage';

/**
 * Various loaders
 */
export interface IconFinderLoaders {
	// Loader for collections list
	collections?: IconFinderStorageLoader<
		StoredIconFinderCollectionsList,
		StoredIconFinderCollectionsParams
	>;

	// Loader for icon set
	iconSet?: IconFinderStorageLoader<
		StoredIconFinderIconSet,
		StoredIconFinderIconSetParams
	>;

	// Loader for search results
	search?: IconFinderStorageLoader<
		StoredIconFinderSearchResults,
		StoredIconFinderSearchQuery
	>;
}
