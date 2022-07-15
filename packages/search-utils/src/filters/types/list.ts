import type {
	IconFinderCategoriesFilters,
	IconFinderCollectionsFilters,
	IconFinderFilters,
	IconFinderIconSetThemeTypes,
	IconFinderTagsFilters,
} from './all';
import type {
	IconFinderCategoriesFilter,
	IconFinderCollectionsFilter,
	IconFinderFilter,
	IconFinderTagsFilter,
	IconFinderThemeFilter,
} from './filter';

interface IconFinderFiltersListMixin<T extends IconFinderFilter> {
	// Type
	type: keyof IconFinderFilters;

	// All filters
	filters: T[];

	// Selected filter
	selected?: T | null;

	// Visible filters count
	visible: number;
}

/**
 * Base filters list
 */
export type IconFinderFiltersList =
	IconFinderFiltersListMixin<IconFinderFilter>;

/**
 * Filters list for categories in collections list
 */
export interface IconFinderCategoriesFiltersList
	extends IconFinderFiltersListMixin<IconFinderCategoriesFilter> {
	// Limit type to categories
	type: keyof IconFinderCategoriesFilters;
}

/**
 * Filters list for tags in icon set
 */
export interface IconFinderTagsFiltersList
	extends IconFinderFiltersListMixin<IconFinderTagsFilter> {
	// Limit type to tags
	type: keyof IconFinderTagsFilters;
}

/**
 * Filters list for themes
 */
export interface IconFinderThemeFiltersList
	extends IconFinderFiltersListMixin<IconFinderThemeFilter> {
	// Limit type to themes
	type: IconFinderIconSetThemeTypes;

	// Filters, sorted in order of matching (longest first). Excludes empty filter
	sorted: IconFinderThemeFilter[];

	// Default empty filter, used when icon does not match other themes
	empty?: IconFinderThemeFilter;
}

/**
 * Filters icon sets in generic page
 */
export interface IconFinderCollectionsFiltersList
	extends IconFinderFiltersListMixin<IconFinderCollectionsFilter> {
	// Limit type to collections
	type: keyof IconFinderCollectionsFilters;

	// Filters, sorted by prefix to quickly find filter
	collections: Map<string, IconFinderCollectionsFilter>;
}
