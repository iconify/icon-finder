import type { IconFinderFiltersList } from './types/list';

/**
 * Update visible filters counter
 */
export function countVisibleFilters(list: IconFinderFiltersList): number {
	let hidden = 0;
	list.filters.forEach((filter) => {
		if (filter.disabled && filter.hiddenIfDisabled) {
			hidden++;
		}
	});
	return (list.visible = list.filters.length - hidden);
}
