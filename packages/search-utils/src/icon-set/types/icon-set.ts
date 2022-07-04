import type { IconifyInfo } from '@iconify/types';
import type { IconFinderFilter } from '../../filters/types';
import type { IconFinderIconSetIcons } from './icons';
import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeTypes,
} from './themes';

/**
 * Source
 */
export type IconFinderIconSetSource = 'api' | 'raw';

/**
 * Themes
 */
export type IconFinderIconSetThemes = Partial<
	Record<IconFinderIconSetThemeTypes, IconFinderIconSetTheme>
>;

/**
 * Filters: themes + categories
 */
export interface IconFinderIconSetFilters extends IconFinderIconSetThemes {
	// Categories
	categories?: IconFinderFilter[];
}

/**
 * Icon set
 */
export interface IconFinderIconSet extends IconFinderIconSetFilters {
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
	// filters: IconFinderIconsListFilters;
}
