import { IconFinderState } from './state';
import { PartialRoute, Icon } from '@iconify/search-core';

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

type IconFinderStateEvents = IconFinderRouteEvent | IconFinderSelectedIconEvent;

/**
 * All events
 */
export type IconFinderEvent = IconFinderLifeCycleEvents | IconFinderStateEvents;
