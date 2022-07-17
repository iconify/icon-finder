import type { IconFinderCollectionsListItem } from './types/collections';
import type {
	StoredIconFinderCollectionsList,
	StoredIconFinderCollectionsParams,
} from './types/storage';
import type { IconFinderStorage } from '../storage/types/storage';

/**
 * Collections storage
 */
export const collectionsStorage: IconFinderStorage<
	StoredIconFinderCollectionsList,
	StoredIconFinderCollectionsParams
> = {
	/**
	 * Prefix for events
	 */
	eventPrefix: 'collections-',

	/**
	 * Key: return as is
	 */
	key: (params) => params,

	/**
	 * Data
	 */
	storage: new Map(),
};

/**
 * Get collections data if available
 */
export function getCollectionsListItemsFromStorage(
	provider: string
): Record<string, IconFinderCollectionsListItem> | undefined {
	return collectionsStorage.storage.get(provider)?.data?.prefixed;
}
