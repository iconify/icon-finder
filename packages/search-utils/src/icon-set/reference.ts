import type { IconFinderIconSetIconsList } from '../icons/types/list';
import type { IconFinderIconSet } from './types/icon-set';

/**
 * Get index of reference icon in icons list
 */
export function findReferenceIconSetIcon(
	iconSet: IconFinderIconSet,
	list: IconFinderIconSetIconsList,
	name: string
): number {
	// Find unique icon, get names of all aliases
	const uniqueIcon = iconSet.icons.uniqueMap.get(name);
	if (!uniqueIcon) {
		return -1;
	}
	const names = new Set(uniqueIcon.icons.map((item) => item.name));

	// Check all icons
	return list.icons.findIndex((item) => names.has(item.name));
}
