import type { IconifyInfo } from '@iconify/types';
import type {
	IconFinderTagsFilters,
	IconFinderThemeFilters,
} from '../../filters/types/all';
import type { IconFinderIconSetIcons } from './icons';

/**
 * Source
 */
export type IconFinderIconSetSource = 'api' | 'raw';

/**
 * Filters: themes + tags
 */
export interface IconFinderIconSetFilters
	extends IconFinderThemeFilters,
		IconFinderTagsFilters {
	//
}

/**
 * Icon set
 */
export interface IconFinderIconSet {
	// Source
	source: IconFinderIconSetSource;

	// Provider and prefix
	provider: string;
	prefix: string;

	// Title: duplicate of info.name
	title: string;

	// Number of visible icons: duplicate of info.total, but cannot be undefined
	total: number;

	// Information
	info: IconifyInfo;

	// Icons list
	icons: IconFinderIconSetIcons;

	// Filters
	filters: IconFinderIconSetFilters;
}
