import { SvelteComponent } from './svelte';
import { IconFinderState } from './state';
import { IconFinderEvent } from './events';

/**
 * Wrapper parameters
 */
export interface IconFinderWrapperParams {
	// Container node
	container: HTMLElement;

	// Container component
	// Using component as parameter makes it easy to add custom wrappers
	component: SvelteComponent;

	// Default state
	state?: Partial<IconFinderState>;

	// Callback
	callback: (event: IconFinderEvent) => void;
}
