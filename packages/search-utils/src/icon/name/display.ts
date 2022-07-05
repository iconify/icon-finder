import type { IconFinderIconsListIconName } from '../types/name';
import { iconNameToString } from './to-string';

/**
 * Get icon name to render
 */
export function getIconNameToDisplay(
	item: IconFinderIconsListIconName
): string {
	if ('id' in item) {
		return item.name;
	}
	return iconNameToString(item);
}
