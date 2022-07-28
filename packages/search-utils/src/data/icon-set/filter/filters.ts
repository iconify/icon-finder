import type { IconFinderIconSetIconName } from '../../icon/types/name';
import type { IconFinderIconSet } from '../types/icon-set';
import type { IconFinderIconSetIconsList } from '../types/list';
import { filterIconSetUniqueIconsByKeyword } from './keyword';

/**
 * Filter icon set
 */
export function filterIconSet(
	iconSet: IconFinderIconSet,
	keyword: string
): IconFinderIconSetIconsList {
	const { id, filters, icons } = iconSet;

	const selectedPrefix = filters.prefixes?.selected;
	const selectedSuffix = filters.suffixes?.selected;
	const selectedTag = filters.tags?.selected;

	const iconNames: IconFinderIconSetIconName[] = [];

	// Filter icons list by keyword, then by filters
	filterIconSetUniqueIconsByKeyword(icons.unique, filters, keyword).forEach(
		(item) => {
			const icons = item.icons;
			for (let i = 0; i < icons.length; i++) {
				const icon = icons[i];

				// Check prefix, suffix and tags
				if (
					(!selectedPrefix || selectedPrefix === icon.prefix) &&
					(!selectedSuffix || selectedSuffix === icon.suffix) &&
					(!selectedTag ||
						(icon.tags && icon.tags.indexOf(selectedTag) !== -1))
				) {
					// Found match
					iconNames.push({
						id,
						name: icon.name,
						render: item.render,
					});
					return;
				}
			}
		}
	);

	// Sort icons
	iconNames.sort((a, b) => a.name.localeCompare(b.name));

	// Return icons list
	return {
		type: 'icon-set',
		source: iconSet,
		filters,
		icons: iconNames,
		pagination: iconSet.pagination,
	};
}
