import type { IconifyInfo } from '@iconify/types';
import type {
	IconFinderFilter,
	IconFinderFiltersList,
} from '../../filters/types';

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
	filter: IconFinderFilter;

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
	filters: IconFinderFiltersList;

	// Sorted by categories
	categorised: Record<string, IconFinderCollectionsCategory>;

	// Sorted by prefix
	prefixed: Record<string, IconFinderCollectionsListItem>;

	// Visible and total icon sets count
	visible: number;
	total: number;
}
