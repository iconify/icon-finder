import type { IconFinderFilter } from '../../filters/types/filter';
import type { IconFinderGenericIconsList } from '../../icons/types/list';

/**
 * Get filter for prefix
 */
export function getCollectionFilterFromIconsList(
	icons: IconFinderGenericIconsList,
	prefix: string
): IconFinderFilter | undefined {
	return icons.filters.collections?.collections?.get(prefix);
}
