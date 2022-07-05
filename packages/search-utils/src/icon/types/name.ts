import type { IconSetID } from '../../icon-set/types/id';

/**
 * Icon name for icon set
 */
export interface IconFinderIconsListIconSetIconName {
	// Icon set
	id: IconSetID;

	// Icon name
	name: string;

	// Icon name to render, could be different than `name` in case of aliases
	render?: string;
}

/**
 * Icon name for generic list, not specific to icon set
 */
export interface IconFinderIconsListGenericIconName {
	provider: string;
	prefix: string;
	name: string;
}

/**
 * Combination
 */
export type IconFinderIconsListIconName =
	| IconFinderIconsListIconSetIconName
	| IconFinderIconsListGenericIconName;
