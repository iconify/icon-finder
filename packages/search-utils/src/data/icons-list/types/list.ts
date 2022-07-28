import type { IconFinderFilters } from '../../filters/types/all';
import type { IconFinderIconsListWithPaginationConfig } from '../../pagination/types/config';

/**
 * Icons + filters + pagination config
 */
export interface IconFinderIconsListIcons<Icon>
	extends IconFinderIconsListWithPaginationConfig {
	// List of icons
	icons: Icon[];

	// Filters
	filters: IconFinderFilters;
}

/**
 * Icons list
 */
export interface IconFinderIconsList<Type, Source, Icon>
	extends IconFinderIconsListIcons<Icon> {
	// Type
	type: Type;

	// Source data
	source: Source;
}
