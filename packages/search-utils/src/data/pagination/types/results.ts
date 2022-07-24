/**
 * Pagination in filtered icons list
 */
export interface IconFinderIconsListPagination {
	// Number of icons per page
	perPage: number;

	// Total number of icons
	total: number;

	// Current page, required
	page: number;

	// Maximum page number, counting starts with 0 (maxPage = 2 -> 3 pages total: 0, 1, 2). Hide pagination if 0
	maxPage: number;

	// Total number of pages. 0 is empty, maxPage + 1 if not empty.
	totalPages: number;

	// True if more results are available. Button "show more" should be displayed
	showMore?: boolean;
}
