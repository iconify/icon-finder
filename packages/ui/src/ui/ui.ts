import Iconify from '@iconify/iconify';
import { Main } from './main';
import { DataStorage } from '../misc/options';
import { CollectionRoute } from '../../../core/lib';

// @iconify-replacement: 'options = {}'
const options = {};

// @iconify-replacement: 'iconifyOptions = {}'
const iconifyOptions = {};

// Temporary solution for Iconify imports. Will be fixed in Iconify 2.0
interface IconifySetConfig {
	(key: string, value: unknown): void;
}
interface IconifyStuff {
	setConfig: IconifySetConfig;
}

Object.keys(iconifyOptions).forEach(key => {
	Iconify.setConfig(key, (iconifyOptions as Record<string, unknown>)[key]);
});

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
