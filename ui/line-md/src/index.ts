import { Wrapper } from '@iconify/search-components/lib/wrapper';
import Container from '@iconify/search-components/lib/ui/Container.svelte';
import { IconFinderEvent } from '@iconify/search-components/lib/wrapper/events';
import { CollectionRouteParams } from '@iconify/search-core';

// Load icon set
fetch('./line-md.json')
	.then((data) => {
		return data.json();
	})
	.then((iconSet) => {
		const container = document.getElementById('container')!;
		const prefix = 'line-md';
		container.innerHTML = '';

		// Create instance
		new Wrapper({
			container,
			component: Container,
			callback: (event: IconFinderEvent) => {
				console.log('Event:', event);
			},
			iconSets: {
				iconSets: [iconSet],
				merge: 'only-custom',
				info: {
					[prefix]: {
						name: 'Material Line Icons',
						author: 'Iconify',
						url: 'https://github.com/iconify',
						license: 'Apache 2.0',
						height: 24,
						samples: ['home', 'image-twotone', 'edit-twotone'],
						palette: false,
						category: 'General',
					},
				},
			},
			state: {
				route: {
					type: 'collection',
					params: {
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
	})
	.catch((err) => {
		document.getElementById('container')!.innerHTML =
			'Error fetching icon sets';
	});
