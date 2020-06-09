import {
	PartialIconCustomisations,
	IconCustomisationPairs,
} from '../misc/customisations';
import { Icon } from '@iconify/search-core';

// Icon selection
export interface UISelectionEvent {
	type: 'selection';
	// If Icon value is a string, empty string = null
	icon: string | Icon | null;
}

// Customisaton has changed
export interface UICustomisationEvent {
	type: 'customisation';
	// Customisation that was changed: {prop, value}
	changed?: IconCustomisationPairs;
	// Current customised customisations
	customisations: PartialIconCustomisations;
}

// Button was clicked in footer
export interface UIFooterButtonEvent {
	type: 'button';
	// Button key
	button: string;
}

// Config was changed
export interface UIConfigEvent {
	type: 'config';
}

// Combined type
export type UIEvent =
	| UISelectionEvent
	| UICustomisationEvent
	| UIFooterButtonEvent
	| UIConfigEvent;
