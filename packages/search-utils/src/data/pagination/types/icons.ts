import type { IconFinderIconsListIcons } from '../../icons-list/types/list';
import type { IconFinderIconsListPagination } from './results';

/**
 * Visible icons list
 */
export interface IconFinderIconsListVisibleIcons<Icon>
	extends IconFinderIconsListIcons<Icon> {
	// Visible icons
	visible: Icon[];

	// Generated pagination
	pages: IconFinderIconsListPagination;
}
