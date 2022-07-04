import type {
	IconFinderCategoriesFiltersList,
	IconFinderTagsFiltersList,
	IconFinderThemeFiltersList,
} from './list';

/**
 * Filters for categories in collections list
 */
export interface IconFinderCategoriesFilters {
	categories?: IconFinderCategoriesFiltersList;
}

/**
 * Tags in icon set
 */
export interface IconFinderTagsFilters {
	tags?: IconFinderTagsFiltersList;
}

/**
 * Filters for themes
 */
export interface IconFinderThemeFilters {
	prefixes?: IconFinderThemeFiltersList;
	suffixes?: IconFinderThemeFiltersList;
}

export type IconFinderIconSetThemeTypes = keyof IconFinderThemeFilters;

/**
 * All filters
 */
export interface IconFinderFilters
	extends IconFinderCategoriesFilters,
		IconFinderTagsFilters,
		IconFinderThemeFilters {
	//
}
