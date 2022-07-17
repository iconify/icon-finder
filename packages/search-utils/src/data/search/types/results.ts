import type { IconFinderGenericIconsList } from '../../icons-list/types/list';

/**
 * Search results
 */
export interface IconFinderSearchResults extends IconFinderGenericIconsList {
	// True if response contains maximum possible results and API most likely has more results
	gotMaxResults: boolean;
}
