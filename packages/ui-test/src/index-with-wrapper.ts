import { Wrapper } from '@iconify/search-components/lib/wrapper';
import Container from '@iconify/search-components/lib/ui/Container.svelte';
import { IconFinderEvent } from '@iconify/search-components/lib/wrapper/events';

// Create instance
const main = new Wrapper({
	container: document.body,
	component: Container,
	callback: (event: IconFinderEvent) => {
		console.log('Event:', event);
	},
});
