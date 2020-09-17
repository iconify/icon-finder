import { SvelteComponent } from './svelte';
import { IconFinderState } from './state';
import { IconFinderEvent } from './events';
import { IconifyJSON } from '@iconify/iconify';
import { IconFinderCustomSets } from '@iconify/search-core';

/**
 * Wrapper parameters
 */
export interface IconFinderWrapperParams {
	// Container node
	container: HTMLElement;

	// Container component
	// Using component as parameter makes it easy to add custom wrappers
	component: SvelteComponent;

	// Custom icon sets
	iconSets?: IconFinderCustomSets | IconifyJSON[];

	// Default state
	state?: Partial<IconFinderState>;

	// Callback
	callback: (event: IconFinderEvent) => void;
}
