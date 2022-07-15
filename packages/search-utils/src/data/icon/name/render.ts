import type { IconifyIconName } from '@iconify/utils';
import type { IconFinderIconName } from '../types/name';

/**
 * Get icon name to render
 */
export function getIconNameToRender(item: IconFinderIconName): IconifyIconName {
	if ('id' in item) {
		return {
			...item.id,
			name: item.render || item.name,
		};
	}
	return item;
}
