import type { BaseBlock } from './types';

export interface PaginationBlock extends BaseBlock {
	readonly type: 'pagination';

	// Current page
	page: number;

	// Length of items list
	length: number;

	// Length of items before filters (optional)
	fullLength?: number;

	// Number of items per page
	perPage: number;

	// True if "show more results" button should be shown
	more?: boolean;
}

/**
 * Default values
 */
export const defaultPaginationBlock = (): PaginationBlock => {
	return {
		type: 'pagination',
		page: 0,
		length: 0,
		perPage: 24,
		more: false,
	};
};

/**
 * Check if pagination is empty
 */
export function isPaginationEmpty(block?: PaginationBlock | null): boolean {
	return block === void 0 || block === null || block.length <= block.perPage;
}

/**
 * Get maximum page number
 */
export function maxPage(block: PaginationBlock): number {
	return block.perPage && block.length > 0
		? Math.floor((block.length - 1) / block.perPage)
		: 0;
}

/**
 * Calculate page where item at index "index" is located
 */
export function getPageForIndex(perPage: number, index: number): number {
	return perPage && index > 0 ? Math.floor(index / perPage) : 0;
}

/**
 * Get list of pages to show
 */
export function showPagination(block: PaginationBlock): number[] {
	const total = block.length ? maxPage(block) + 1 : 0;
	const pagination: number[] = [];

	let i, min;

	// Less than 2 pages
	if (total < 2) {
		return pagination;
	}

	// Show all pages
	// 3 first + total+-2 + 3 last + 2 spacers = 13
	if (total < 14) {
		for (i = 0; i < total; i++) {
			pagination.push(i);
		}
		return pagination;
	}

	// First 3 pages
	for (i = 0; i < Math.min(total, 3); i++) {
		pagination.push(i);
	}
	if ((min = i) >= total) {
		return pagination;
	}

	// Current +- 2 (or - 3 if only 1 page is skipped)
	for (
		i = min === block.page - 3 ? min : Math.max(block.page - 2, min);
		i < Math.min(block.page + 3, total);
		i++
	) {
		pagination.push(i);
	}
	if ((min = i) >= total) {
		return pagination;
	}

	// Last 3 (or 4 if only 1 page is skipped)
	for (
		i = min === total - 4 ? total - 4 : Math.max(total - 3, min);
		i < total;
		i++
	) {
		pagination.push(i);
	}

	return pagination;
}
