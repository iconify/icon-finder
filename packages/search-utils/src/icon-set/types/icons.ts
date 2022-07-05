import type { IconFinderTagsFilter } from '../../filters/types/filter';

/**
 * Icon
 */
export interface IconFinderIconSetIcon {
	// Icon name without provider and prefix
	name: string;

	// True if hidden
	hidden?: boolean;

	// List of tags icon belongs to
	tags?: IconFinderTagsFilter[];
}

/**
 * Unique icon
 */
export interface IconFinderIconSetUniqueIcon {
	// Icons that match it, including icon in `render`
	icons: IconFinderIconSetIcon[];

	// Icon name to render, defaults to first entry in `icons` property
	render?: string;

	// List of tags icons belong to
	tags?: IconFinderTagsFilter[];

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
