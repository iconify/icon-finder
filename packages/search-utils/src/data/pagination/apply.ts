import type { IconFinderIconsListPagination } from './types/results';

/**
 * Slice visible icons
 */
export function applyPagination<Icon>(
	icons: Icon[],
	pages: IconFinderIconsListPagination
): Icon[] {
	const { perPage, page } = pages;
	return icons.slice(perPage * page, perPage * (page + 1));
}
