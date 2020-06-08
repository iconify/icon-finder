import { UI } from './ui';

// Create instance
const main = new UI({
	container: document.body,
	callback: (event, payload) => {
		console.log('Callback:', event, payload);
	},
	/*
	selectedIcon: {
		prefix: 'mdi',
		name: 'home',
	},
	*/
	/*
	route: ({
		type: 'collection',
		params: {
			prefix: 'ic',
		},
		parent: {
			type: 'collections',
		},
	} as unknown) as CollectionRoute,
	*/
	// iconProps: {
	// 	rotate: 1,
	// },
});
