import type { IconFinderCollectionsListItem } from './collections';

/**
 * Stored data (actual item is identical to parent item because these properties do not change)
 */
export type StoredIconFinderCollectionsListItem = Pick<
	IconFinderCollectionsListItem,
	'prefix' | 'title' | 'category' | 'info' | 'color'
>;

/**
 * Storage type
 */
export type StoredIconFinderCollectionsList = Record<
	string,
	StoredIconFinderCollectionsListItem
>;
