import type { IconifyIconName } from '@iconify/utils';
import type { IconSetID } from '../../icon-set/types/id';

/**
 * Icon name for icon set
 */
export interface IconFinderIconSetIconName {
	// Icon set
	id: IconSetID;

	// Icon name
	name: string;

	// Icon name to render, could be different than `name` in case of aliases
	render: string;
}

/**
 * Icon name for generic list, not specific to icon set
 */
export type IconFinderGenericIconName = IconifyIconName;

/**
 * Combination
 */
export type IconFinderIconName =
	| IconFinderIconSetIconName
	| IconFinderGenericIconName;
