import type { IconFinderFiltersList } from '../../filters/types';
import type { IconFinderIconSetThemeTypes } from '../../icon-set/types/themes';

/**
 * Types of filters
 */
export type IconFinderIconsListFilterType =
	// Sort by icon set: search results, bookmarks
	| 'icon-set'
	// Icon set themes
	| IconFinderIconSetThemeTypes
	| 'categories';

/**
 * Filters list
 */
export type IconFinderIconsListFilters = Partial<
	Record<IconFinderIconsListFilterType, IconFinderFiltersList>
>;
