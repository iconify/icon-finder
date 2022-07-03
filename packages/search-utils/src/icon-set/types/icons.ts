import type { IconFinderIconSetCategory } from './category';

/**
 * Icon
 */
export interface IconFinderIconSetIcon {
	// Icon name without provider and prefix
	name: string;

	// True if hidden
	hidden?: boolean;

	// List of categories icon belongs to
	categories?: IconFinderIconSetCategory[];
}

/**
 * Unique icon
 */
export interface IconFinderIconSetUniqueIcon {
	// Icons that match it, including icon in `render`
	icons: IconFinderIconSetIcon[];

	// Icon to render
	render: string;

	// List of categories icons belong to
	categories?: IconFinderIconSetCategory[];

	// True if all icons are hidden
	hidden?: boolean;

	// Transformations, excluding current icon. Points to icons in `map` property of icons list to avoid recursion
	transformations?: string[];
}

/**
 * Icons list
 */
export interface IconFinderIconSetIcons {
	// Map of all icons, including aliases and hidden icons. Multiple entries can point to same icon
	map: Record<string, IconFinderIconSetUniqueIcon>;

	// Unique icons: icon + aliases + clones
	unique: IconFinderIconSetUniqueIcon[];
}
