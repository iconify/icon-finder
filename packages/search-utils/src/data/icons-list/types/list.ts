import type { IconFinderFilters } from '../../filters/types/all';

/**
 * Icons + filters
 */
export interface IconFinderIconsListIcons<Icon> {
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
