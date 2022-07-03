import { setFiltersColors } from '../../filters/colors';
import { countVisibleFilters } from '../../filters/count';
import type { IconFinderFiltersList } from '../../filters/types';
import { filterCollectionsList } from '../filter/map';
import { getDefaultCollectionsListCallback } from '../filter/reset';
import type { IconFinderCollectionsList } from '../types/collections';
import { generateSearchData } from './search';

/**
 * Finalise collections list: update counters, clean up filters
 */
export function finaliseCollectionsList(list: IconFinderCollectionsList) {
	// Add filters
	const filters: IconFinderFiltersList['filters'] = [];
	let hidden = 0;
	for (const title in list.categorised) {
		const category = list.categorised[title];

		// Count visible icon sets
		category.visible = category.items.reduce((count, item) => {
			return item.info.hidden ? count : count + 1;
		}, 0);

		// Disable filter if category is empty
		const filter = category.filter;
		if (!category.visible) {
			filter.disabled = filter.hiddenIfDisabled = true;
			hidden++;
		}

		filters.push(filter);
	}

	list.filters = {
		filters,
		visible: filters.length - hidden,
	};

	// Set total counter
	list.total = Object.keys(list.prefixed).length;

	// Add data for searching and colors
	let color = 0;
	for (const prefix in list.prefixed) {
		const item = list.prefixed[prefix];
		item.color = color++;
		item.searchData = generateSearchData(prefix, item.info);
	}

	// Update counters by clearing filters
	filterCollectionsList(list, getDefaultCollectionsListCallback(list));

	// Update filters
	setFiltersColors(list.filters);
	countVisibleFilters(list.filters);
}
