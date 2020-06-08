import { Icon, PartialRoute } from '@iconify/search-core';
/**
 * Icon finder state.
 *
 * All elements could be empty
 */
export interface IconFinderState {
	// Selected icon
	icon: Icon | null;

	// Current route
	route?: PartialRoute;
}
