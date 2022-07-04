import type { IconFinderFilter } from '../../filters/types';

/**
 * Theme types
 */
export type IconFinderIconSetThemeTypes = 'prefixes' | 'suffixes';

/**
 * Prefix or suffix
 */
export interface IconFinderIconSetThemeItem extends IconFinderFilter {
	// Match value, including '-'
	match: string;
}

/**
 * Theme
 */
export interface IconFinderIconSetTheme {
	// Theme type
	type: IconFinderIconSetThemeTypes;

	// Items, in same order as in JSON file, including empty item
	filters: IconFinderIconSetThemeItem[];

	// Sorted matches, without empty item, shorted match first
	sorted: IconFinderIconSetThemeItem[];

	// Default empty item
	empty?: IconFinderIconSetThemeItem;
}
