import type { IconFinderCollectionsList } from '../types/collections';
import type { FilterCollectionsListCallback } from '../types/filter';
import { filterCollectionsList } from './map';
import { getDefaultCollectionsListCallback } from './reset';

/**
 * Apply filters
 */
export function applyCollectionsListFilter(list: IconFinderCollectionsList) {
	const keywords = list.search
		.split(/\s+/)
		.map((item) => item.toLowerCase())
		.filter((keyword) => keyword !== '');

	const categoriesFilters = list.filters.categories;
	const selectedFilter = categoriesFilters && categoriesFilters.selected;

	// Main callback
	const defaultCallback = getDefaultCollectionsListCallback(list);
	let keywordCallback = defaultCallback;
	if (keywords.length) {
		keywordCallback = (item) => {
			const searchData = item.searchData;

			if (!defaultCallback(item) || !searchData) {
				return false;
			}

			for (let i = 0; i < keywords.length; i++) {
				if (searchData.indexOf(keywords[i]) === -1) {
					return false;
				}
			}

			return true;
		};
	}

	// Filters callback
	const filtersCallback: FilterCollectionsListCallback | undefined =
		selectedFilter
			? (item) => item.category === selectedFilter.title
			: void 0;

	// Apply filters
	filterCollectionsList(list, keywordCallback, filtersCallback);
}
