import { BaseBlock } from './types';

/**
 * One filter
 */
export interface FiltersFilter {
	title: string;

	// Index for color rotation
	index?: number;

	// True if disabled
	disabled?: boolean;
}

/**
 * Default values for filter
 */
export const defaultFilter = (title: string): FiltersFilter => {
	return {
		title,
		index: 0,
		disabled: false,
	};
};

/**
 * Block structure
 */
export interface FiltersBlock extends BaseBlock {
	readonly type: 'filters';

	// Filters type
	filterType: string;

	// Active filter key, null if none
	active: string | null;

	// List of filters. Each filter must have unique key, usually same as title
	filters: {
		[index: string]: FiltersFilter;
	};
}

/**
 * Default value
 */
export const defaultFiltersBlock = (): FiltersBlock => {
	return {
		type: 'filters',
		filterType: '',
		active: null,
		filters: Object.create(null),
	};
};

/**
 * Check if block is empty
 */
export function isFiltersBlockEmpty(block?: FiltersBlock | null): boolean {
	return (
		block === void 0 ||
		block === null ||
		Object.keys(block.filters).length < 2
	);
}

/**
 * Enable or disable all filters in block
 */
export function enableFilters(block: FiltersBlock, enable = true): void {
	Object.keys(block.filters).forEach(filter => {
		block.filters[filter].disabled = !enable;
	});
}

/**
 * Set indexes to all filters
 *
 * Returns next start index to chain index multiple sets of filters
 */
export function autoIndexFilters(block: FiltersBlock, start = 0): number {
	let index = start;
	Object.keys(block.filters).forEach(filter => {
		block.filters[filter].index = index++;
	});
	return index;
}
