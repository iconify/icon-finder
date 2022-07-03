import type { IconifyInfo } from '@iconify/types';
import type { IconFinderIconSetCategory } from './category';
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
 * Icon set
 */
export interface IconFinderIconSet extends IconFinderIconSetThemes {
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

	// Prefixes/suffixes are added from IconFinderIconSetThemes

	// Categories
	categories?: IconFinderIconSetCategory[];
}
