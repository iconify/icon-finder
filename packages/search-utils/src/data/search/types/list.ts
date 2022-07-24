import type { IconFinderGenericIconName } from '../../icon/types/name';
import type { IconFinderIconsList } from '../../icons-list/types/list';
import type { IconFinderSearchResults } from './results';

/**
 * Icons list for search results
 */
export type IconFinderSearchResultsIconsList = IconFinderIconsList<
	'search',
	IconFinderSearchResults,
	IconFinderGenericIconName
>;
