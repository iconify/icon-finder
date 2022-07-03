/**
 * Theme types
 */
export type IconFinderIconSetThemeTypes = 'prefixes' | 'suffixes';

/**
 * Prefix or suffix
 */
export interface IconFinderIconSetThemeItem {
	// Title
	title: string;

	// Match value, including '-'
	match: string;

	// Palette index
	color?: number;
}

/**
 * Theme
 */
export interface IconFinderIconSetTheme {
	// Theme type
	type: IconFinderIconSetThemeTypes;

	// Items, in same order as in JSON file, including empty item
	items: IconFinderIconSetThemeItem[];

	// Sorted matches, without empty item, shorted match first
	sorted: IconFinderIconSetThemeItem[];

	// Default empty item
	empty?: IconFinderIconSetThemeItem;
}
