import { countVisibleFilters } from '../../filters/count';
import type { IconFinderCollectionsList } from '../types/collections';
import type { FilterCollectionsListCallback } from '../types/filter';

/**
 * Filter collections list
 */
export function filterCollectionsList(
	list: IconFinderCollectionsList,
	callback: FilterCollectionsListCallback,
	filtersCallback?: FilterCollectionsListCallback
) {
	// Reset counters, filter icon sets
	list.visible = 0;

	for (const category in list.categorised) {
		const categoryItem = list.categorised[category];
		const filter = categoryItem.filter;
		filter.disabled = true;

		let categoryVisibleItems = 0;

		// Check all items
		categoryItem.items.forEach((item) => {
			// Run callbacks. First checks keyword, second checks selected filter
			let show = callback(item);
			if (show) {
				// Filter has items: enable filter
				filter.disabled = false;
			}

			// Run second callback: filter by selected filter
			if (filtersCallback && show) {
				show = filtersCallback(item);
			}

			if (show) {
				categoryVisibleItems++;
			}
			item.filtered = !show;
		});

		categoryItem.visible = categoryVisibleItems;
		list.visible += categoryVisibleItems;
	}

	// Update filters counter
	const categoriesFilters = list.filters.categories;
	if (categoriesFilters) {
		countVisibleFilters(categoriesFilters);
	}
}
