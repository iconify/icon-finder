import type { IconFinderIconSetFilters } from '../types/icon-set';
import type { IconFinderIconSetUniqueIcon } from '../types/icons';

/**
 * Disable all filters
 */
function disableAllFilters(filters: IconFinderIconSetFilters) {
	for (const key in filters) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		filters[key as keyof IconFinderIconSetFilters]!.filters.forEach(
			(item) => (item.disabled = true)
		);
	}
}

// 'render' is required
interface IconFinderIconSetUniqueIconWithRender
	extends IconFinderIconSetUniqueIcon {
	render: string;
}

/**
 * Filter unique icons
 *
 * Function creates new unique icons list and disables filters
 */
export function filterIconSetUniqueIconsByKeyword(
	icons: IconFinderIconSetUniqueIcon[],
	filters: IconFinderIconSetFilters,
	search: string
): IconFinderIconSetUniqueIconWithRender[] {
	search = search.toLowerCase().trim();

	// Disable all filters
	disableAllFilters(filters);

	// Map icons
	const mappedIcons = icons.map((item) => {
		// Get name to render
		const itemIcons = item.icons;
		const render = item.render || itemIcons[0].name;

		// Filter icons by name
		const icons = itemIcons.filter((icon) => {
			const name = icon.name;
			if (
				// Show hidden icons only if direct match for filter
				(icon.hidden && name !== search) ||
				// Filter by name
				name.indexOf(search) === -1
			) {
				return false;
			}

			// Enable filters
			icon.prefix && (icon.prefix.disabled = false);
			icon.suffix && (icon.suffix.disabled = false);
			icon.tags?.forEach((filter) => (filter.disabled = false));

			return true;
		});

		// Return new unique icon, undefined if not available
		if (icons.length) {
			const result: IconFinderIconSetUniqueIconWithRender = {
				...item,
				icons,
				render,
			};
			return result;
		}
	});

	// Filter icons
	return mappedIcons.filter(
		(item) => !!item
	) as IconFinderIconSetUniqueIconWithRender[];
}
