import type { IconFinderIconsListPagination } from './types/pagination';

/**
 * Items per page
 */
let defaultItemsPerPage = 48;

export function setDefaultItemsPerPage(value: number) {
	defaultItemsPerPage = value;
}

/**
 * Empty pagination
 */
export function newPagination(): IconFinderIconsListPagination {
	return {
		page: 0,
		itemsPerPage: defaultItemsPerPage,
	};
}
