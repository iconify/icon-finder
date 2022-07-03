import type { IconFinderCollectionsList } from '../types/collections';
import type { FilterCollectionsListCallback } from '../types/filter';

/**
 * Callback to clear filters
 */
export function getDefaultCollectionsListCallback(
	list: IconFinderCollectionsList
): FilterCollectionsListCallback {
	return (item) => list.showHidden || !item.info.hidden;
}
