/**
 * Pagination config in data source
 */
export interface IconFinderPaginationConfig {
	// Number of icons per page, defaults to utilsConfig.iconsPerPage
	perPage?: number;

	// Current page, starts with 0
	page?: number;
}

/**
 * Data with pagination config
 */
export interface IconFinderIconsListWithPaginationConfig {
	pagination: IconFinderPaginationConfig;
}
