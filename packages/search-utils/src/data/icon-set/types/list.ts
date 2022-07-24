import type { IconFinderIconSetIconName } from '../../icon/types/name';
import type { IconFinderIconsList } from '../../icons-list/types/list';
import type { IconFinderIconSet } from './icon-set';

/**
 * Filtered icons list for icon set
 */
export type IconFinderIconSetIconsList = IconFinderIconsList<
	'icon-set',
	IconFinderIconSet,
	IconFinderIconSetIconName
>;
