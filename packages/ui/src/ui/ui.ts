import { Main } from './main';
import { DataStorage } from '../misc/options';

// @iconify-replacement: 'options = {}'
const options = {};

// Test default route
/*
(options as DataStorage).router = {
	home: JSON.stringify({
		type: 'collection',
		params: {
			prefix: 'mdi',
		},
	}),
};
*/

// Create instance
const main = new Main({
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
	options: options as DataStorage,
	iconProps: {
		rotate: 1,
	},
});
