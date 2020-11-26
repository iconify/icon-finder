import 'mocha';
import { expect } from 'chai';
import type {
	FullCollectionsRoute,
	FullCollectionRoute,
	FullSearchRoute,
	FullCustomRoute,
} from '../../lib/route/types/routes';
import { objectToRoute } from '../../lib/route/convert';

describe('Testing route', () => {
	it('objectToRoute(collections)', () => {
		type ResultType = FullCollectionsRoute;
		const routeType = 'collections';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		expected = {
			type: routeType,
			params: {
				provider: '',
				filter: '',
				category: null,
			},
			parent: null,
		};
		result = objectToRoute({
			type: routeType,
		}) as ResultType;
		expect(result).to.be.eql(expected);

		// Route with parameters
		result = objectToRoute({
			type: routeType,
			params: {
				category: 'General',
			},
		}) as ResultType;
		expected = {
			type: routeType,
			params: {
				provider: '',
				filter: '',
				category: 'General',
			},
			parent: null,
		};
		expect(result).to.be.eql(expected);

		// Invalid params, bad parent
		result = objectToRoute(({
			type: routeType,
			params: {
				page: 10,
			},
			parent: {
				type: 'whatever',
			},
		} as unknown) as ResultType) as ResultType;
		expect(result).to.be.equal(null);
	});

	it('objectToRoute(collection)', () => {
		type ResultType = FullCollectionRoute;
		const routeType = 'collection';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				prefix: 'md',
			},
		}) as ResultType;
		expected = {
			type: routeType,
			params: {
				provider: '',
				prefix: 'md',
				filter: '',
				icon: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null,
		};
		expect(result).to.be.eql(expected);

		// Missing prefix
		result = objectToRoute({
			type: routeType,
		} as ResultType) as ResultType;
		expect(result).to.be.eql(null);

		// With parameters and parent
		result = objectToRoute({
			type: routeType,
			params: {
				prefix: 'md',
				filter: 'arrow',
				icon: 'arrow-left',
				page: 10,
				tag: 'Arrows',
				themePrefix: 'baseline',
				themeSuffix: 'twotone',
			},
			parent: {
				type: 'collections',
			},
		}) as ResultType;
		expected = {
			type: routeType,
			params: {
				provider: '',
				prefix: 'md',
				filter: 'arrow',
				icon: 'arrow-left',
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
		};
		expect(result).to.be.eql(expected);

		// Invalid fields
		result = objectToRoute(({
			type: 'collection',
			params: {
				prefix: 'el',
				filter: 'home',
			},
			parent: {
				type: 'search',
				params: {
					// Should be 'search'
					query: 'home',
					limit: 64,
				},
			},
		} as unknown) as ResultType) as ResultType;
		expect(result).to.be.equal(null);
	});

	it('objectToRoute(search)', () => {
		type ResultType = FullSearchRoute;
		const routeType = 'search';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				search: 'arrow',
			},
		}) as ResultType;
		expected = {
			type: routeType,
			params: {
				provider: '',
				search: 'arrow',
				short: true,
				page: 0,
			},
			parent: null,
		};
		expect(result).to.be.eql(expected);

		// Missing query
		result = objectToRoute({
			type: routeType,
		} as ResultType) as ResultType;
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
		}) as ResultType;
		expected = {
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
		};
		expect(result).to.be.eql(expected);
	});

	it('objectToRoute(custom)', () => {
		type ResultType = FullCustomRoute;
		const routeType = 'custom';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRoute({
			type: routeType,
			params: {
				customType: 'recent',
			},
		}) as ResultType;
		expected = {
			type: routeType,
			params: {
				customType: 'recent',
				filter: '',
				page: 0,
			},
			parent: null,
		};
		expect(result).to.be.eql(expected);

		// Missing customType
		result = objectToRoute({
			type: routeType,
		} as ResultType) as ResultType;
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
		}) as ResultType;
		expected = {
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
		};
		expect(result).to.be.eql(expected);
	});

	it('objectToRoute(invalid)', () => {
		// Missing customType
		const result = objectToRoute(({
			type: 'whatever',
		} as unknown) as FullCollectionsRoute);
		expect(result).to.be.eql(null);
	});
});
