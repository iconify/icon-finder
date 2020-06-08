import { RouterEvent } from '@iconify/search-core';

/**
 * Fake Svelte component type.
 *
 * Used as parameter because TypeScript cannot import .svelte files yet.
 */

// Component options
export interface SvelteComponentOptions {
	target: Element;
	anchor?: Element;
	props?: Record<string, unknown>;
	hydrate?: boolean;
	intro?: boolean;
}

// Component
export type SvelteComponent = unknown;

// Component instance
export interface SvelteComponentInstance {
	$$: Required<SvelteComponentOptions>;
	$set: (props: Record<string, unknown> | RouterEvent) => void;
}
