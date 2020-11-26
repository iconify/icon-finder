import 'mocha';
import { expect } from 'chai';
import { routeParamsToObject } from '../../lib/route/convert';

describe('Testing route parameters', () => {
	it('routeParamsToObject(collections)', () => {
		const routeType = 'collections';
		let result: Record<string, unknown>;

		// Empty route
		result = routeParamsToObject(routeType, {
			provider: '',
			filter: '',
			category: null,
		});
		expect(result).to.be.eql({});

		// Empty route with missing attributes. Should not happen!
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({
			provider: void 0,
			filter: void 0,
			category: void 0,
		});

		// Empty category: uncategorized
		result = routeParamsToObject(routeType, {
			provider: '',
			filter: '',
			category: '',
		});
		expect(result).to.be.eql({
			category: '',
		});

		// All parameters
		result = routeParamsToObject(routeType, {
			provider: 'custom',
			filter: 'mdi',
			category: 'General',
		});
		expect(result).to.be.eql({
			provider: 'custom',
			filter: 'mdi',
			category: 'General',
		});
	});

	it('routeParamsToObject(collection)', () => {
		const routeType = 'collection';
		let result: Record<string, unknown>;

		// Empty route
		result = routeParamsToObject(routeType, {
			provider: '',
			// Prefix cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			prefix: '',
			filter: '',
			icon: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		});
		expect(result).to.be.eql({
			prefix: '',
		});

		// Empty route with missing attributes. Should not happen!
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({
			provider: void 0,
			prefix: void 0,
			filter: void 0,
			icon: void 0,
			page: void 0,
			tag: void 0,
			themePrefix: void 0,
			themeSuffix: void 0,
		});

		// Empty strings for tags and theme, defaults for everything else except prefix
		result = routeParamsToObject(routeType, {
			provider: '',
			prefix: 'md',
			filter: '',
			icon: '',
			page: 0,
			tag: '',
			themePrefix: '',
			themeSuffix: '',
		});
		expect(result).to.be.eql({
			prefix: 'md',
			tag: '',
			themePrefix: '',
			themeSuffix: '',
		});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			provider: 'test',
			prefix: 'md-light',
			filter: 'outline',
			icon: 'home',
			page: 1,
			tag: 'Tag',
			themePrefix: 'baseline',
			themeSuffix: 'twotone',
		});
		expect(result).to.be.eql({
			provider: 'test',
			prefix: 'md-light',
			filter: 'outline',
			icon: 'home',
			page: 1,
			tag: 'Tag',
			themePrefix: 'baseline',
			themeSuffix: 'twotone',
		});
	});

	it('routeParamsToObject(search)', () => {
		const routeType = 'search';
		let result: Record<string, unknown>;

		// Empty route
		result = routeParamsToObject(routeType, {
			provider: '',
			// Search query cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			search: '',
			short: true,
			page: 0,
		});
		expect(result).to.be.eql({
			search: '',
		});

		// Empty route with missing attributes. Should not happen!
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({
			provider: void 0,
			page: void 0,
			search: void 0,
			short: void 0,
		});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			provider: 'custom',
			search: 'arrow left',
			short: false,
			page: 1,
		});
		expect(result).to.be.eql({
			provider: 'custom',
			search: 'arrow left',
			short: false,
			page: 1,
		});
	});

	it('routeParamsToObject(custom)', () => {
		const routeType = 'custom';
		let result: Record<string, unknown>;

		// Empty route
		result = routeParamsToObject(routeType, {
			// Type cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			customType: '',
			filter: '',
			page: 0,
		});
		expect(result).to.be.eql({
			customType: '',
		});

		// Empty route with missing attributes. Should not happen!
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({
			customType: void 0,
			filter: void 0,
			page: void 0,
		});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			customType: 'recent',
			filter: 'arrow',
			page: 1,
		});
		expect(result).to.be.eql({
			customType: 'recent',
			filter: 'arrow',
			page: 1,
		});
	});
});
