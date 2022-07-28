interface IconFinderPaginationBase {
	// Unique key for binding components
	key: string;
}

/**
 * Dot: used between page items when previous and next pages are not sequential
 */
interface IconFinderPaginationDot extends IconFinderPaginationBase {
	type: 'dot';
}

/**
 * Page item
 */
export interface IconFinderPaginationPageItem extends IconFinderPaginationBase {
	type: 'page';

	// Text: page number as string, starts with '1'
	text: string;

	// True if selected
	selected?: boolean;

	// Link
	href?: string;

	// Event
	click?: () => void;
}

/**
 * Pagination
 */
export interface IconFinderPaginationPages {
	isEmpty: boolean;

	// All pages
	pages: (IconFinderPaginationDot | IconFinderPaginationPageItem)[];

	// Previous page
	prev?: IconFinderPaginationPageItem;

	// Next page
	next?: IconFinderPaginationPageItem;

	// First page
	first?: IconFinderPaginationPageItem;

	// Last page
	last?: IconFinderPaginationPageItem;
}
