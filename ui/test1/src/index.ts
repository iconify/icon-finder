import { Wrapper } from '@iconify/search-components/lib/wrapper';
import Container from '@iconify/search-components/lib/ui/Container.svelte';
import { IconFinderEvent } from '@iconify/search-components/lib/wrapper/events';
import { PartialIconCustomisations } from '@iconify/search-components/lib/misc/customisations';
import {
	PartialRoute,
	CollectionRouteParams,
	CollectionsRouteParams,
	CollectionsRoute,
} from '@iconify/search-core';

document.body.innerHTML = '<div id="container"></div><div id="controls"></div>';
const container = document.getElementById('container')!;
const controls = document.getElementById('controls')!;
controls.style.padding = '8px';

// Create instance
const main = new Wrapper({
	container: container,
	component: Container,
	callback: (event: IconFinderEvent) => {
		console.log('Event:', event);
	},
	state: {
		icon: {
			provider: 'local',
			prefix: 'clarity',
			name: 'alarm-off-solid',
		},
		customisations: {
			rotate: 1,
			color: '#f20',
		},
		route: {
			type: 'collection',
			params: {
				prefix: 'clarity',
				provider: 'local',
			} as CollectionRouteParams,
			parent: {
				type: 'collections',
				params: {
					provider: 'local',
				} as CollectionsRouteParams,
			} as CollectionsRoute,
		},
		config: {
			components: {
				list: true,
			},
		},
	},
});

// Test changing values before first render
// main.selectIcon('mdi:home');
/*
main.setCustomisations({
	color: 'blue',
});
*/
/*
main.setRoute({
	type: 'collection',
	params: {
		prefix: 'mdi-light',
	},
	parent: {
		type: 'collections',
	},
} as PartialRoute);
*/

// Controls
controls.innerHTML = `
	Changing state:<br />
	Select icon: <span class="select-icons"></span><br />
	Customisations: <span class="change-props"></span><br />
	Route: <span class="change-route"></span><br />
	<br />
	Life cycle: <span class="life-cycle"></span><br />
`;

const icons = ['', 'mdi-home', '@local:line-md:home-twotone'];
controls.querySelectorAll('span.select-icons').forEach((parent) => {
	icons.forEach((icon) => {
		const link = document.createElement('a');
		link.href = '#';
		link.addEventListener('click', (event) => {
			event.preventDefault();
			main.selectIcon(icon);
		});
		link.innerText = icon === '' ? 'none' : icon;
		link.style.marginRight = '.5em';
		parent.appendChild(link);
	});
});

const props: Record<string, PartialIconCustomisations> = {
	'none': {},
	'rotate 90deg': {
		rotate: 1,
	},
	'rotate and flip': {
		rotate: 3,
		hFlip: true,
	},
	'color and height': {
		color: '#90f',
		height: '48',
	},
};
controls.querySelectorAll('span.change-props').forEach((parent) => {
	Object.keys(props).forEach((text) => {
		const prop = props[text];
		const link = document.createElement('a');
		link.href = '#';
		link.addEventListener('click', (event) => {
			event.preventDefault();
			main.setCustomisations(prop);
		});
		link.innerText = text;
		link.style.marginRight = '.5em';
		parent.appendChild(link);
	});
});

const routes: Record<string, PartialRoute | null> = {
	'none': null,
	'home': {
		type: 'collections',
	},
	'line 24': {
		type: 'collection',
		params: {
			prefix: 'line-md',
			provider: 'local',
		} as CollectionRouteParams,
		parent: {
			type: 'collections',
			params: {
				provider: 'local',
			} as CollectionsRouteParams,
		} as CollectionsRoute,
	},
	'empty': {
		type: 'empty',
	},
};
controls.querySelectorAll('span.change-route').forEach((parent) => {
	Object.keys(routes).forEach((text) => {
		const route = routes[text];
		const link = document.createElement('a');
		link.href = '#';
		link.addEventListener('click', (event) => {
			event.preventDefault();
			main.setRoute(route);
		});
		link.innerText = text;
		link.style.marginRight = '.5em';
		parent.appendChild(link);
	});
});

type WrapperFunction = () => void;
const cycles: Record<string, WrapperFunction> = {
	'get state': () => {
		console.log('State:', JSON.stringify(main.getState(), null, 4));
	},
	'get status': () => {
		console.log('Status:', main.getStatus());
	},
	'hide': main.hide.bind(main),
	'show': main.show.bind(main),
	'destroy': main.destroy.bind(main),
};
controls.querySelectorAll('span.life-cycle').forEach((parent) => {
	Object.keys(cycles).forEach((text) => {
		const func = cycles[text];
		const link = document.createElement('a');
		link.href = '#';
		link.addEventListener('click', (event) => {
			event.preventDefault();
			func();
		});
		link.innerText = text;
		link.style.marginRight = '.5em';
		parent.appendChild(link);
	});
});
