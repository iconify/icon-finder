import { Wrapper } from '@iconify/search-components/lib/wrapper';
import Container from '@iconify/search-components/lib/ui/Container.svelte';
import { IconFinderEvent } from '@iconify/search-components/lib/wrapper/events';

// Load icon sets
import iconSetMDI from './icons/mdi.json';
import iconSetMDILight from './icons/mdi-light.json';

// Create instance
const main = new Wrapper({
	container: document.getElementById('container')!,
	component: Container,
	callback: (event: IconFinderEvent) => {
		console.log('Event:', event);
	},
	iconSets: {
		iconSets: [iconSetMDI, iconSetMDILight],
		merge: 'only-custom',
	},
	state: {
		route: {
			type: 'collections',
		},
	},
});
