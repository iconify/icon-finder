import { Wrapper } from '@iconify/search-components/lib/wrapper';
import Container from '@iconify/search-components/lib/ui/Container.svelte';
import { IconFinderEvent } from '@iconify/search-components/lib/wrapper/events';
import { CollectionRouteParams } from '@iconify/search-core';

// Load icon set
import iconSet from './icons/line-md.json';

const provider = '';
const prefix = 'line-md';

// Create instance
const main = new Wrapper({
	container: document.getElementById('container')!,
	component: Container,
	callback: (event: IconFinderEvent) => {
		console.log('Event:', event);
	},
	iconSets: {
		iconSets: [iconSet],
		merge: 'only-custom',
		provider,
		info: {
			[prefix]: {
				name: 'Line 24',
				author: 'Iconify',
				url: 'https://github.com/iconify',
				license: 'Apache 2.0',
				height: 24,
				samples: ['home', 'arrow-left', 'edit-twotone'],
				palette: false,
				category: 'General',
			},
		},
	},
	state: {
		/*
		icon: {
			provider,
			prefix,
			name: 'home',
		},
		*/
		route: {
			type: 'collection',
			params: {
				provider,
				prefix,
			} as CollectionRouteParams,
		},
		config: {
			ui: {
				itemsPerPage: 15 * 4,
			},
			components: {
				list: false,
			},
		},
	},
});
