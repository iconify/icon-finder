import type { IconFinderFiltersList } from '../../filters/types';
import type { IconFinderIconSetThemeTypes } from '../../icon-set/types/themes';

/**
 * Types of filters
 */
export type IconFinderIconSetFilterType =
	// Sort by icon set: search results, bookmarks
	| 'icon-set'
	// Icon set themes
	| IconFinderIconSetThemeTypes
	| 'category';

/**
 * Filters list
 */
export type IconFinderIconSetFilters = Partial<
	Record<string, IconFinderFiltersList>
>;
