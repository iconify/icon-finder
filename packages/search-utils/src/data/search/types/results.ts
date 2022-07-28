import type { IconFinderGenericIconName } from '../../icon/types/name';
import type { IconFinderIconsListIcons } from '../../icons-list/types/list';

/**
 * Search results
 */
export interface IconFinderSearchResults
	extends IconFinderIconsListIcons<IconFinderGenericIconName> {
	// True if response contains maximum possible results and API most likely has more results
	gotMaxResults: boolean;
}
