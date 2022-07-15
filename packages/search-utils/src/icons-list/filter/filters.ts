import type { IconFinderGenericIconsList } from '../../icons/types/list';

/**
 * Filter generic icons list
 */
export function filterGenericIconsList<T extends IconFinderGenericIconsList>(
	icons: T
): T {
	const sourceIcons = icons.icons;
	let iconsList: typeof sourceIcons;

	// Check collections filter
	const collectionsFilters = icons.filters.collections;
	const selectedFilter = collectionsFilters?.selected;
	if (selectedFilter) {
		const prefix = selectedFilter.prefix;

		// Filter by prefix
		iconsList = sourceIcons.filter((item) => item.prefix === prefix);
	} else {
		iconsList = sourceIcons.slice(0);
	}

	// Return
	return {
		...icons,
		icons: iconsList,
	};
}
