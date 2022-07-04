import type { IconFinderFiltersList } from './types/list';

/**
 * Set colors
 */
export function setFiltersColors(list: IconFinderFiltersList, start = 0) {
	list.filters.forEach((filter, index) => {
		filter.color = index + start;
	});
}
