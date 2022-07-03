import type { IconFinderIcon } from '../../icon/types/icon';

/**
 * Pagination
 */
export interface IconFinderIconsListPagination {
	// Current page
	page: number;

	// Number of items per page
	itemsPerPage: number;

	// Reference icon to adjust current page when filter is clicked
	reference?: IconFinderIcon;

	// "Show more" button
	showMoreAction?: () => void;

	// Callback to call when pagination changes
	paginationCallback?: (page: number) => void;
}
