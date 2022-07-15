import type { IconFinderIconSetIconName } from '../../icon/types/name';
import type { IconFinderIconSetIconsList } from '../../icons-list/types/list';
import type { IconFinderIconSet } from '../types/icon-set';
import { filterIconSetUniqueIconsByKeyword } from './keyword';

/**
 * Filter icon set
 */
export function filterIconSet(
	iconSet: IconFinderIconSet,
	keyword: string
): IconFinderIconSetIconsList {
	const { id, filters } = iconSet;

	const selectedPrefix = filters.prefixes?.selected;
	const selectedSuffix = filters.suffixes?.selected;
	const selectedTag = filters.tags?.selected;

	const iconNames: IconFinderIconSetIconName[] = [];

	// Filter icons list by keyword, then by filters
	filterIconSetUniqueIconsByKeyword(
		iconSet.icons.unique,
		filters,
		keyword
	).forEach((item) => {
		const icons = item.icons;
		for (let i = 0; i < icons.length; i++) {
			const icon = icons[i];
			// Check prefix and suffix
			if (selectedPrefix && selectedPrefix !== icon.prefix) {
				continue;
			}
			if (selectedSuffix && selectedSuffix !== icon.suffix) {
				continue;
			}

			// Check tags
			if (
				selectedTag &&
				(!icon.tags || icon.tags.indexOf(selectedTag) == -1)
			) {
				continue;
			}

			// Found match
			iconNames.push({
				id,
				name: icon.name,
				render: item.render,
			});
			return;
		}
	});

	// Sort icons
	iconNames.sort((a, b) => a.name.localeCompare(b.name));

	// Return icons list
	return {
		type: 'icon-set',
		filters,
		icons: iconNames,
	};
}
