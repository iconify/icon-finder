import 'mocha';
import { expect } from 'chai';
import {
	objectToRouteParams,
	CollectionsRouteParams,
	CollectionRouteParams,
	SearchRouteParams,
	CustomRouteParams,
	RouteType,
} from '../../lib/route/params';

describe('Testing route parameters', () => {
	it('objectToRouteParams(collections)', () => {
		type ResultType = CollectionsRouteParams;
		const routeType = 'collections';
		let result: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {}) as CollectionsRouteParams;
		expect(result).to.be.eql({
			provider: '',
			filter: '',
			category: null,
		});

		// Testing non-object parameters. Intentionally breaking TS types
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		result = objectToRouteParams(routeType, true) as CollectionsRouteParams;
		expect(result).to.be.eql({
			provider: '',
			filter: '',
			category: null,
		});

		// Category as empty string
		result = objectToRouteParams(routeType, {
			category: '',
		}) as CollectionsRouteParams;
		expect(result).to.be.eql({
			provider: '',
			filter: '',
			category: '',
		});

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'custom',
			filter: 'MDI', // should be changed to lower case
			category: 'General',
		}) as ResultType;
		expect(result).to.be.eql({
			provider: 'custom',
			filter: 'mdi',
			category: 'General',
		});

		// Invalid type and invalid attribute
		result = objectToRouteParams(routeType, {
			provider: true, // must be string
			filter: null, // must be string
			category: true, // must be string or null,
			page: 10, // no such attribute
			query: 'Whatever', // no such attribute
		} as object) as ResultType;
		expect(result).to.be.eql({
			provider: '',
			filter: '',
			category: null,
		});
	});

	it('objectToRouteParams(collection)', () => {
		type ResultType = CollectionRouteParams;
		const routeType = 'collection';
		let result: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			prefix: 'md',
		}) as ResultType;
		expect(result).to.be.eql({
			provider: '',
			prefix: 'md',
			filter: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		});

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'test',
			prefix: 'foo-bar',
			filter: 'Arrow', // should be changed to lower case
			page: 2,
			tag: '', // empty string
			themePrefix: 'outline',
			themeSuffix: 'twotone',
		}) as ResultType;
		expect(result).to.be.eql({
			provider: 'test',
			prefix: 'foo-bar',
			filter: 'arrow',
			page: 2,
			tag: '',
			themePrefix: 'outline',
			themeSuffix: 'twotone',
		});

		// Invalid and extra parameters
		result = objectToRouteParams(routeType, {
			prefix: 'required-prefix',
			filter: true, // must be string
			page: '1', // must be number
			tag: false, // must be string or null
			themePrefix: /a-z/, // must be string or null
			themeSuffix: 1, // must be string or null
			theme: 'test', // no such attribute
			total: 20, // no such attribute
			prefixes: ['foo', 'bar'], // no such attribute
		} as object) as ResultType;
		expect(result).to.be.eql({
			provider: '',
			prefix: 'required-prefix',
			filter: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		});

		// No prefix
		expect(function () {
			result = objectToRouteParams(routeType, {}) as ResultType;
		}).to.throw(Error);

		expect(function () {
			// Intentionally breaking TS types
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			result = objectToRouteParams(routeType, 100) as ResultType;
		}).to.throw(Error);

		// Empty prefix
		expect(function () {
			result = objectToRouteParams(routeType, {
				prefix: '',
			}) as ResultType;
		}).to.throw(Error);

		// Non-string prefix
		expect(function () {
			result = objectToRouteParams(routeType, {
				prefix: true,
			} as object) as ResultType;
		}).to.throw(Error);
	});

	it('objectToRouteParams(search)', () => {
		type ResultType = SearchRouteParams;
		const routeType = 'search';
		let result: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			search: 'home',
		}) as ResultType;
		expect(result).to.be.eql({
			provider: '',
			search: 'home',
			short: true,
			page: 0,
		});

		// Add all parameters
		result = objectToRouteParams(routeType, {
			provider: 'custom',
			search: 'Arrow', // should be changed to lower case
			short: false,
			page: 10,
		}) as ResultType;
		expect(result).to.be.eql({
			provider: 'custom',
			search: 'arrow',
			short: false,
			page: 10,
		});

		// Invalid parameter types and extra parameters
		result = objectToRouteParams(routeType, {
			provider: ['test'], // must be string
			search: 'arrows',
			short: 0, // must be boolean
			page: '1', // must be number
			total: 20, // no such parameter
			tag: 'Outline', // no such parameter
		} as object) as ResultType;
		expect(result).to.be.eql({
			provider: '',
			search: 'arrows',
			short: true,
			page: 0,
		});

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
			result = objectToRouteParams(routeType, {
				search: true,
			} as object) as ResultType;
		}).to.throw(Error);
	});

	it('objectToRouteParams(custom)', () => {
		type ResultType = CustomRouteParams;
		const routeType = 'custom';
		let result: ResultType;

		// Empty route
		result = objectToRouteParams(routeType, {
			customType: 'favorites',
		}) as ResultType;
		expect(result).to.be.eql({
			customType: 'favorites',
			filter: '',
			page: 0,
		});

		// Add all parameters
		result = objectToRouteParams(routeType, {
			customType: 'recent',
			filter: 'Arrow', // should be changed to lower case
			page: 2,
		}) as ResultType;
		expect(result).to.be.eql({
			customType: 'recent',
			filter: 'arrow',
			page: 2,
		});

		// Invalid parameter types and extra parameters
		result = objectToRouteParams(routeType, {
			customType: 'recent',
			filter: null, // must be string
			page: false, // must be number
			total: 20, // no such parameter
			search: 'home', // no such parameter
		} as object) as ResultType;
		expect(result).to.be.eql({
			customType: 'recent',
			filter: '',
			page: 0,
		});

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
			result = objectToRouteParams(routeType, {
				customType: true,
			} as object) as ResultType;
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
			// Intentionally breaking TS types
			// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
			// @ts-ignore
			objectToRouteParams(true, {});
		}).to.throw(Error);
	});
});
