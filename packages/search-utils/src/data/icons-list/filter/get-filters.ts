import type { IconFinderFilter } from '../../filters/types/filter';
import type { IconFinderGenericIconName } from '../../icon/types/name';
import type { IconFinderIconsListIcons } from '../types/list';

/**
 * Get filter for prefix
 */
export function getCollectionFilterFromIconsList(
	icons: IconFinderIconsListIcons<IconFinderGenericIconName>,
	prefix: string
): IconFinderFilter | undefined {
	return icons.filters.collections?.collections?.get(prefix);
}
