import type { IconFinderFilters } from '../../filters/types/all';
import type {
	IconFinderGenericIconName,
	IconFinderIconSetIconName,
} from '../../icon/types/name';

interface IconFinderIconsListMixin<Type, Icon> {
	// Type
	type: Type;

	// List of icons
	icons: Icon[];

	// Filters
	filters: IconFinderFilters;
}

/**
 * Icons list for icon set
 */
export type IconFinderIconSetIconsList = IconFinderIconsListMixin<
	'icon-set',
	IconFinderIconSetIconName
>;

/**
 * Icons list, not specific to icon set
 */
export type IconFinderGenericIconsList = IconFinderIconsListMixin<
	'generic',
	IconFinderGenericIconName
>;

/**
 * Combination
 */
export type IconFinderIconsList =
	| IconFinderIconSetIconsList
	| IconFinderGenericIconsList;
