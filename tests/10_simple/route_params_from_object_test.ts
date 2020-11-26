import 'mocha';
import { expect } from 'chai';
import type {
	FullCollectionsRouteParams,
	FullCollectionRouteParams,
	FullSearchRouteParams,
	FullCustomRouteParams,
} from '../../lib/route/types/params';
import type { RouteType } from '../../lib/route/types/routes';
import { objectToRouteParams } from '../../lib/route/convert';

describe('Testing route parameters', () => {
	it('objectToRouteParams(collections)', () => {
		type ResultType = FullCollectionsRouteParams;
		const routeType = 'collections';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {}) as ResultType;
		expected = {
			provider: '',
			filter: '',
			category: null,
		};
		expect(result).to.be.eql(expected);

		// Category as empty string
		expected = {
			provider: '',
			filter: '',
			category: '',
		};
		result = objectToRouteParams(routeType, {
			category: '',
		}) as ResultType;
		expect(result).to.be.eql(expected);

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'custom',
			filter: 'MDI', // should be changed to lower case
			category: 'General',
		}) as ResultType;
		expected = {
			provider: 'custom',
			filter: 'mdi',
			category: 'General',
		};
		expect(result).to.be.eql(expected);

		// Invalid type and invalid attribute
		result = objectToRouteParams(routeType, {
			provider: true, // must be string
			filter: null, // must be string
			category: true, // must be string or null,
			page: 10, // no such attribute
			query: 'Whatever', // no such attribute
		}) as ResultType;
		expected = {
			provider: '',
			filter: '',
			category: null,
		};
		expect(result).to.be.eql(expected);
	});

	it('objectToRouteParams(collection)', () => {
		type ResultType = FullCollectionRouteParams;
		const routeType = 'collection';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			prefix: 'md',
		}) as ResultType;
		expected = {
			provider: '',
			prefix: 'md',
			filter: '',
			icon: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		};
		expect(result).to.be.eql(expected);

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'test',
			prefix: 'foo-bar',
			filter: 'Arrow', // should be changed to lower case
			icon: 'baz',
			page: 2,
			tag: '', // empty string
			themePrefix: 'outline',
			themeSuffix: 'twotone',
		}) as ResultType;
		expected = {
			provider: 'test',
			prefix: 'foo-bar',
			filter: 'arrow',
			icon: 'baz',
			page: 2,
			tag: '',
			themePrefix: 'outline',
			themeSuffix: 'twotone',
		};
		expect(result).to.be.eql(expected);

		// Invalid and extra parameters
		result = objectToRouteParams(routeType, ({
			prefix: 'required-prefix',
			filter: true, // must be string
			icon: {
				// expecting only icon name as string, not full icon object
				provider: '',
				prefix: 'foo',
				name: 'bar',
			},
			page: '1', // must be number
			tag: false, // must be string or null
			themePrefix: /a-z/, // must be string or null
			themeSuffix: 1, // must be string or null
			theme: 'test', // no such attribute
			total: 20, // no such attribute
			prefixes: ['foo', 'bar'], // no such attribute
		} as unknown) as ResultType) as ResultType;
		expected = {
			provider: '',
			prefix: 'required-prefix',
			filter: '',
			icon: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		};
		expect(result).to.be.eql(expected);

		// No prefix
		expect(function () {
			result = objectToRouteParams(routeType, {}) as ResultType;
		}).to.throw(Error);

		expect(function () {
			result = objectToRouteParams(
				routeType,
				(100 as unknown) as ResultType
			) as ResultType;
		}).to.throw(Error);

		// Empty prefix
		expect(function () {
			result = objectToRouteParams(routeType, {
				prefix: '',
			}) as ResultType;
		}).to.throw(Error);

		// Non-string prefix
		expect(function () {
			result = objectToRouteParams(routeType, ({
				prefix: true,
			} as unknown) as ResultType) as ResultType;
		}).to.throw(Error);
	});

	it('objectToRouteParams(search)', () => {
		type ResultType = FullSearchRouteParams;
		const routeType = 'search';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			search: 'home',
		}) as ResultType;
		expected = {
			provider: '',
			search: 'home',
			short: true,
			page: 0,
		};
		expect(result).to.be.eql(expected);

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'custom',
			search: 'Arrow', // should be changed to lower case
			short: false,
			page: 10,
		}) as ResultType;
		expected = {
			provider: 'custom',
			search: 'arrow',
			short: false,
			page: 10,
		};
		expect(result).to.be.eql(expected);

		// Invalid parameter types and extra parameters
		result = objectToRouteParams(routeType, ({
			provider: ['test'], // must be string
			search: 'arrows',
			short: 0, // must be boolean
			page: '1', // must be number
			total: 20, // no such parameter
			tag: 'Outline', // no such parameter
		} as unknown) as ResultType) as ResultType;
		expected = {
			provider: '',
			search: 'arrows',
			short: true,
			page: 0,
		};
		expect(result).to.be.eql(expected);

		// No query
		expect(function () {
			result = objectToRouteParams(routeType, {}) as ResultType;
		}).to.throw(Error);

		// Empty query
		expect(function () {
			result = objectToRouteParams(routeType, {
				search: '',
			}) as ResultType;
		}).to.throw(Error);

		// Non-string query
		expect(function () {
			result = objectToRouteParams(routeType, ({
				search: true,
			} as unknown) as ResultType) as ResultType;
		}).to.throw(Error);
	});

	it('objectToRouteParams(custom)', () => {
		type ResultType = FullCustomRouteParams;
		const routeType = 'custom';
		let result: ResultType;
		let expected: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			customType: 'favorites',
		}) as ResultType;
		expected = {
			customType: 'favorites',
			filter: '',
			page: 0,
		};
		expect(result).to.be.eql(expected);

		// Add all parameters
		result = objectToRouteParams(routeType, {
			customType: 'recent',
			filter: 'Arrow', // should be changed to lower case
			page: 2,
		}) as ResultType;
		expected = {
			customType: 'recent',
			filter: 'arrow',
			page: 2,
		};
		expect(result).to.be.eql(expected);

		// Invalid parameter types and extra parameters
		result = objectToRouteParams(routeType, {
			customType: 'recent',
			filter: null, // must be string
			page: false, // must be number
			total: 20, // no such parameter
			search: 'home', // no such parameter
		}) as ResultType;
		expected = {
			customType: 'recent',
			filter: '',
			page: 0,
		};
		expect(result).to.be.eql(expected);

		// No type
		expect(function () {
			result = objectToRouteParams(routeType, {}) as ResultType;
		}).to.throw(Error);

		// Empty type
		expect(function () {
			result = objectToRouteParams(routeType, {
				customType: '',
			}) as ResultType;
		}).to.throw(Error);

		// Non-string type
		expect(function () {
			result = objectToRouteParams(routeType, ({
				customType: true,
			} as unknown) as ResultType) as ResultType;
		}).to.throw(Error);
	});

	it('objectToRouteParams(invalid)', () => {
		// Wrong type
		expect(function () {
			objectToRouteParams(('bookmark' as unknown) as RouteType, {});
		}).to.throw(Error);

		// Wrong case
		expect(function () {
			objectToRouteParams(('Collections' as unknown) as RouteType, {});
		}).to.throw(Error);

		// Non-string type
		expect(function () {
			objectToRouteParams((true as unknown) as RouteType, {});
		}).to.throw(Error);
	});
});
