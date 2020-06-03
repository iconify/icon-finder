import 'mocha';
import { expect } from 'chai';
import {
	objectToRoute,
	CollectionsRoute,
	CollectionRoute,
	SearchRoute,
	CustomRoute,
	PartialRoute,
} from '../../lib/route/types';
import { PartialRouteParams } from '../../lib/route/params';

describe('Testing route', () => {
	it('objectToRoute(collections)', () => {
		type ResultType = CollectionsRoute;
		const routeType = 'collections';
		let result: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
		}) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				filter: '',
				category: null,
			},
			parent: null,
		});

		// Route with parameters
		result = objectToRoute({
			type: routeType,
			params: {
				category: 'General',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				filter: '',
				category: 'General',
			},
			parent: null,
		});

		// Invalid params, bad parent
		result = objectToRoute(({
			type: routeType,
			params: {
				page: 10,
			},
			parent: {
				type: 'whatever',
			},
		} as unknown) as PartialRoute) as ResultType;
		expect(result).to.be.equal(null);
	});

	it('objectToRoute(collection)', () => {
		type ResultType = CollectionRoute;
		const routeType = 'collection';
		let result: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				prefix: 'md',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				prefix: 'md',
				filter: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null,
		});

		// Missing prefix
		result = objectToRoute({
			type: routeType,
		}) as ResultType;
		expect(result).to.be.eql(null);

		// With parameters and parent
		result = objectToRoute({
			type: routeType,
			params: {
				prefix: 'md',
				filter: 'arrow',
				page: 10,
				tag: 'Arrows',
				themePrefix: 'baseline',
				themeSuffix: 'twotone',
			},
			parent: {
				type: 'collections',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				prefix: 'md',
				filter: 'arrow',
				page: 10,
				tag: 'Arrows',
				themePrefix: 'baseline',
				themeSuffix: 'twotone',
			},
			parent: {
				type: 'collections',
				params: {
					provider: '',
					filter: '',
					category: null,
				},
				parent: null,
			},
		});

		// Confuse route with API query in parent route
		result = objectToRoute({
			type: 'collection',
			params: {
				prefix: 'el',
				filter: 'home',
			},
			parent: {
				type: 'search',
				params: {
					query: 'home',
					limit: 64,
				} as PartialRouteParams,
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.equal(null);
	});

	it('objectToRoute(search)', () => {
		type ResultType = SearchRoute;
		const routeType = 'search';
		let result: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				search: 'arrow',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				search: 'arrow',
				short: true,
				page: 0,
			},
			parent: null,
		});

		// Missing query
		result = objectToRoute({
			type: routeType,
		}) as ResultType;
		expect(result).to.be.eql(null);

		// Parameters and parent route
		result = objectToRoute({
			type: routeType,
			params: {
				search: 'arrow',
				short: false,
				page: 1,
			},
			parent: {
				type: 'collections',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				provider: '',
				search: 'arrow',
				short: false,
				page: 1,
			},
			parent: {
				type: 'collections',
				params: {
					provider: '',
					filter: '',
					category: null,
				},
				parent: null,
			},
		});
	});

	it('objectToRoute(custom)', () => {
		type ResultType = CustomRoute;
		const routeType = 'custom';
		let result: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				customType: 'recent',
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				customType: 'recent',
				filter: '',
				page: 0,
			},
			parent: null,
		});

		// Missing customType
		result = objectToRoute({
			type: routeType,
		}) as ResultType;
		expect(result).to.be.eql(null);

		// Parameters and parent route
		result = objectToRoute({
			type: routeType,
			params: {
				customType: 'recent',
				filter: 'arrow',
				page: 5,
			},
			parent: {
				type: routeType,
				params: {
					customType: 'bookmarks',
					page: 1,
				},
			},
		} as PartialRoute) as ResultType;
		expect(result).to.be.eql({
			type: routeType,
			params: {
				customType: 'recent',
				filter: 'arrow',
				page: 5,
			},
			parent: {
				type: routeType,
				params: {
					customType: 'bookmarks',
					filter: '',
					page: 1,
				},
				parent: null,
			},
		});
	});

	it('objectToRoute(invalid)', () => {
		// Missing customType
		const result = objectToRoute(({
			type: 'whatever',
		} as unknown) as PartialRoute);
		expect(result).to.be.eql(null);
	});
});
