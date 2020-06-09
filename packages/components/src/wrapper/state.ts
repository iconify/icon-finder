import { Icon, PartialRoute, IconFinderConfig } from '@iconify/search-core';
import { PartialIconCustomisations } from '../misc/customisations';
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

	// Customisations
	customisations?: PartialIconCustomisations;

	// Config changes
	config?: IconFinderConfig;
}
