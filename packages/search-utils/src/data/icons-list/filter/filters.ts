import type { IconFinderGenericIconName } from '../../icon/types/name';
import type { IconFinderIconsListIcons } from '../types/list';

/**
 * Filter generic icons list
 */
export function filterGenericIconsList<
	T extends IconFinderIconsListIcons<IconFinderGenericIconName>
>(icons: T): T {
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
