import { IconFinderState } from './state';
import { PartialRoute, Icon } from '@iconify/search-core';
import { PartialIconCustomisations } from '../misc/customisations';

/**
 * Life cycle events
 */

// Event triggered when component has been loaded for the first time, ready to be modified
export interface IconFinderLoadEvent {
	type: 'load';
}

type IconFinderLifeCycleEvents = IconFinderLoadEvent;

/**
 * State events
 */

// Event triggered when route changes
export interface IconFinderRouteEvent {
	type: 'route';
	route: PartialRoute;
}

// Event triggered when icon has been selected
export interface IconFinderSelectedIconEvent {
	type: 'icon';
	icon: Icon | null;
}

// Even triggered when customisations have changed
export interface IconFinderCustomisationsEvent {
	type: 'customisations';
	customisations: PartialIconCustomisations;
}

type IconFinderStateEvents =
	| IconFinderRouteEvent
	| IconFinderSelectedIconEvent
	| IconFinderCustomisationsEvent;

/**
 * All events
 */
export type IconFinderEvent = IconFinderLifeCycleEvents | IconFinderStateEvents;
