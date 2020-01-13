import 'mocha';
import { expect } from 'chai';
import {
	routeToObject,
	CollectionsRoute,
	CollectionRoute,
	SearchRoute,
	CustomRoute,
	PartialRoute,
} from '../../lib/route/types';

describe('Testing route', () => {
	it('routeToObject(collections)', () => {
		const routeType = 'collections';
		let result: PartialRoute;

		// Empty route
		result = routeToObject({
			type: routeType,
			params: {
				// Default values, so params should be skipped
				filter: '',
				category: null,
			},
			parent: null, // Null, so parent should be skipped
		} as CollectionsRoute);
		expect(result).to.be.eql({
			type: 'collections',
		});

		// Parent route and all values in parent route
		result = routeToObject({
			type: routeType,
			params: {
				filter: '',
				category: 'General',
			},
			parent: {
				// Use collections as parent, but in real code collections should have no parent
				type: routeType,
				params: {
					filter: 'home',
					category: '', // Empty string, not null
				},
				parent: null, // Null, so parent should be skipped
			},
		} as CollectionsRoute);
		expect(result).to.be.eql({
			type: 'collections',
			params: {
				category: 'General',
			},
			parent: {
				type: 'collections',
				params: {
					filter: 'home',
					category: '',
				},
			},
		});
	});

	it('routeToObject(collections)', () => {
		const routeType = 'collection';
		let result: PartialRoute;

		// Empty route
		result = routeToObject({
			type: routeType,
			params: {
				// Default values, so params should be skipped
				prefix: '', // No prefix to test result without params
				filter: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null, // Null, so parent should be skipped
		} as CollectionRoute);
		expect(result).to.be.eql({
			type: 'collection',
		});

		// With prefix
		result = routeToObject({
			type: routeType,
			params: {
				prefix: 'md',
				filter: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null, // Null, so parent should be skipped
		} as CollectionRoute);
		expect(result).to.be.eql({
			type: 'collection',
			params: {
				prefix: 'md',
			},
		});

		// Collections as parent and custom values
		result = routeToObject({
			type: routeType,
			params: {
				prefix: 'md',
				filter: 'arrow',
				page: 1,
				tag: 'Arrows',
				themePrefix: null,
				themeSuffix: null,
			},
			parent: {
				type: 'collections',
				params: {
					filter: '',
					category: null,
				},
				parent: null,
			} as CollectionsRoute,
		} as CollectionRoute);
		expect(result).to.be.eql({
			type: 'collection',
			params: {
				prefix: 'md',
				filter: 'arrow',
				page: 1,
				tag: 'Arrows',
			},
			parent: {
				type: 'collections',
			},
		});
	});

	it('routeToObject(search)', () => {
		const routeType = 'search';
		let result: PartialRoute;

		// Empty route
		result = routeToObject({
			type: routeType,
			params: {
				// Default values, so params should be skipped
				search: '', // No query to test result without params
				short: true,
				page: 0,
			},
			parent: null, // Null, so parent should be skipped
		} as SearchRoute);
		expect(result).to.be.eql({
			type: 'search',
		});

		// With query and full results
		result = routeToObject({
			type: routeType,
			params: {
				search: 'home',
				short: false,
				page: 0,
			},
			parent: null, // Null, so parent should be skipped
		} as SearchRoute);
		expect(result).to.be.eql({
			type: 'search',
			params: {
				search: 'home',
				short: false,
			},
		});

		// With parent and pagination
		result = routeToObject({
			type: routeType,
			params: {
				search: 'home',
				short: false,
				page: 2,
			},
			parent: {
				type: 'collections',
				params: {
					filter: '',
					category: null,
				},
				parent: null,
			} as CollectionsRoute,
		} as SearchRoute);
		expect(result).to.be.eql({
			type: 'search',
			params: {
				search: 'home',
				short: false,
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		});
	});

	it('routeToObject(custom)', () => {
		const routeType = 'custom';
		let result: PartialRoute;

		// Empty route
		result = routeToObject({
			type: routeType,
			params: {
				// Default values, so params should be skipped
				customType: '', // No type to test with result without params
				filter: '',
				page: 0,
			},
			parent: null, // Null, so parent should be skipped
		} as CustomRoute);
		expect(result).to.be.eql({
			type: 'custom',
		});

		// Route with type
		result = routeToObject({
			type: routeType,
			params: {
				customType: 'recent',
				filter: '',
				page: 0,
			},
			parent: null, // Null, so parent should be skipped
		} as CustomRoute);
		expect(result).to.be.eql({
			type: 'custom',
			params: {
				customType: 'recent',
			},
		});

		// Route with all parameters
		result = routeToObject({
			type: routeType,
			params: {
				customType: 'recent',
				filter: 'box',
				page: 1,
			},
			parent: {
				type: routeType,
				params: {
					customType: 'bookmarks',
					filter: '',
					page: 0,
				},
				parent: null,
			},
		} as CustomRoute);
		expect(result).to.be.eql({
			type: 'custom',
			params: {
				customType: 'recent',
				filter: 'box',
				page: 1,
			},
			parent: {
				type: 'custom',
				params: {
					customType: 'bookmarks',
				},
			},
		});
	});
});
