import type {
	IconFinderPaginationPageItem,
	IconFinderPaginationPages,
} from './types/pages';
import type { IconFinderIconsListPagination } from './types/results';

/**
 * Get visible pages
 */
function getVisiblePages(total: number, page: number): number[] {
	const pagination: number[] = [];
	let i, min: number;

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
		i = min === page - 3 ? min : Math.max(page - 2, min);
		i < Math.min(page + 3, total);
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

/**
 * Generate pages
 */
export function generatePages(
	pagination: IconFinderIconsListPagination,
	href?: (page: number) => string,
	click?: (page: number) => void
): IconFinderPaginationPages {
	const total = pagination.totalPages;

	if (total < 2) {
		// Nothing to show
		return {
			isEmpty: true,
			pages: [],
		};
	}

	// Not empty
	const currentPage = pagination.page;
	const maxPage = pagination.maxPage;
	const pages: IconFinderPaginationPages['pages'] = [];
	const result: IconFinderPaginationPages = {
		isEmpty: false,
		pages,
	};

	const visible = getVisiblePages(total, currentPage);
	let lastPage = -1;
	visible.forEach((page) => {
		const text = (page + 1).toString();
		if (page > lastPage + 1) {
			// Add dot
			pages.push({
				type: 'dot',
				key: 'dot-' + text,
			});
		}

		// New item
		lastPage = page;
		const item: IconFinderPaginationPageItem = {
			type: 'page',
			key: text,
			text,
		};
		if (href) {
			item.href = href(page);
		}
		if (click) {
			item.click = click.bind(null, page);
		}

		pages.push(item);

		// Update item status, set prev/next/first/last
		if (page === currentPage) {
			item.selected = true;
		} else {
			if (page === currentPage - 1) {
				result.prev = item;
			}
			if (page === currentPage + 1) {
				result.next = item;
			}
			if (!page && currentPage) {
				result.first = item;
			}
			if (currentPage === maxPage) {
				result.last = item;
			}
		}
	});

	return result;
}
