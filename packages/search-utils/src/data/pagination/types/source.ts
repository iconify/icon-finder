/**
 * Pagination in source data
 */
export interface IconFinderPaginationConfig {
	// Number of icons per page, defaults to utilsConfig.iconsPerPage
	perPage?: number;

	// Current page, starts with 0 (add 1 for tooltip)
	page?: number;
}

/**
 * Extended config for icon sets
 */
export interface IconFinderPaginationIconSetConfig
	extends IconFinderPaginationConfig {
	// Reference icon
	icon?: string;
}
