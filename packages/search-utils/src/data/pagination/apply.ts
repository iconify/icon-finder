import type { IconFinderIconsListIcons } from '../icons-list/types/list';
import { getPaginationResult } from './calc';
import type { IconFinderIconsListVisibleIcons } from './types/icons';

/**
 * Apply pagination to icons list
 *
 * This function modifies original object, adding `pages` and `visible` properties
 */
export function applyPagination<Icon>(
	icons: IconFinderIconsListIcons<Icon>
): IconFinderIconsListVisibleIcons<Icon> {
	const allIcons = icons.icons;
	const pages = ((icons as IconFinderIconsListVisibleIcons<Icon>).pages =
		getPaginationResult(icons.pagination, allIcons.length));

	const { page, perPage } = pages;
	(icons as IconFinderIconsListVisibleIcons<Icon>).visible = allIcons.slice(
		perPage * page,
		perPage * (page + 1)
	);

	return icons as IconFinderIconsListVisibleIcons<Icon>;
}
