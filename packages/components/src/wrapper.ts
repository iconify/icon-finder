import { Icon, PartialRoute } from '@iconify/search-core';

/**
 * Icon finder state.
 *
 * All elements could be empty
 */
export interface IconFinderState {
	// Selected icon
	icon?: Icon;

	// Current route
	route?: PartialRoute;
}

/**
 * Wrapper parameters
 */
export interface IconFinderWrapperParams {
	// Container node
	container: Element;

	// Default state
	defaultState?: IconFinderState;
}

export class Wrapper {}
