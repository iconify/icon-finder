import type { IconFinderGenericIconsList } from '../../icons-list/types/list';

/**
 * Search results
 */
export interface IconFinderSearchResults extends IconFinderGenericIconsList {
	// True if response contains maximum possible results and API most likely has more results
	gotMaxResults: boolean;

	// Event to trigger to get more results. Should be done when showing last page of results
	loadMore?: () => void;
}
