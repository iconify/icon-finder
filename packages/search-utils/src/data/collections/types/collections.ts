import type { IconifyInfo } from '@iconify/types';
import type { IconFinderCategoriesFilters } from '../../filters/types/all';
import type { IconFinderCategoriesFilter } from '../../filters/types/filter';

/**
 * Icon set
 */
export interface IconFinderCollectionsListItem {
	// Icon set prefix
	readonly prefix: string;

	// Title
	readonly title: string;

	// Info
	readonly info: IconifyInfo;

	// Category
	readonly category: string;

	// Palette
	color?: number;

	// True if icon set is filtered out (hidden)
	filtered?: boolean;

	// Search data
	searchData?: string;
}

/**
 * Category
 */
export interface IconFinderCollectionsCategory {
	// Category
	title: string;

	// Items
	items: IconFinderCollectionsListItem[];

	// Filter item
	filter: IconFinderCategoriesFilter;

	// Visible icon sets count
	visible: number;
}

/**
 * Icon sets list
 */
export interface IconFinderCollectionsList {
	// Search
	search: string;
	showHidden?: boolean;

	// Category filters
	filters: IconFinderCategoriesFilters;

	// Sorted by categories
	categorised: Record<string, IconFinderCollectionsCategory>;

	// Sorted by prefix
	prefixed: Record<string, IconFinderCollectionsListItem>;

	// Visible and total icon sets count
	visible: number;
	total: number;
}
