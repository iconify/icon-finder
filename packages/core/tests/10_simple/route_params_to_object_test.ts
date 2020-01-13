import 'mocha';
import { expect } from 'chai';
import {
	routeParamsToObject,
	CollectionsRouteParams,
	CollectionRouteParams,
	SearchRouteParams,
	CustomRouteParams,
	PartialRouteParams,
} from '../../lib/route/params';

describe('Testing route parameters', () => {
	it('routeParamsToObject(collections)', () => {
		type ParamType = CollectionsRouteParams;
		const routeType = 'collections';
		let result: PartialRouteParams;

		// Empty route
		result = routeParamsToObject(routeType, {
			filter: '',
			category: null,
		} as ParamType);
		expect(result).to.be.eql({});

		// Empty route with missing attributes (TS should not allow it, but testing it anyway)
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({});

		// Empty category: uncategorized
		result = routeParamsToObject(routeType, {
			filter: '',
			category: '',
		} as ParamType);
		expect(result).to.be.eql({
			category: '',
		});

		// All parameters
		result = routeParamsToObject(routeType, {
			filter: 'mdi',
			category: 'General',
		} as ParamType);
		expect(result).to.be.eql({
			filter: 'mdi',
			category: 'General',
		});
	});

	it('routeParamsToObject(collection)', () => {
		type ParamType = CollectionRouteParams;
		const routeType = 'collection';
		let result: PartialRouteParams;

		// Empty route
		result = routeParamsToObject(routeType, {
			// Prefix cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			prefix: '',
			filter: '',
			page: 0,
			tag: null,
			themePrefix: null,
			themeSuffix: null,
		} as ParamType);
		expect(result).to.be.eql({});

		// Empty route with missing attributes (TS should not allow it, but testing it anyway)
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({});

		// Empty strings for tags and theme, defaults for everything else except prefix
		result = routeParamsToObject(routeType, {
			prefix: 'md',
			filter: '',
			page: 0,
			tag: '',
			themePrefix: '',
			themeSuffix: '',
		} as ParamType);
		expect(result).to.be.eql({
			prefix: 'md',
			tag: '',
			themePrefix: '',
			themeSuffix: '',
		});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			prefix: 'md-light',
			filter: 'outline',
			page: 1,
			tag: 'Tag',
			themePrefix: 'baseline',
			themeSuffix: 'twotone',
		} as ParamType);
		expect(result).to.be.eql({
			prefix: 'md-light',
			filter: 'outline',
			page: 1,
			tag: 'Tag',
			themePrefix: 'baseline',
			themeSuffix: 'twotone',
		});
	});

	it('routeParamsToObject(search)', () => {
		type ParamType = SearchRouteParams;
		const routeType = 'search';
		let result: PartialRouteParams;

		// Empty route
		result = routeParamsToObject(routeType, {
			// Search query cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			search: '',
			short: true,
			page: 0,
		} as ParamType);
		expect(result).to.be.eql({});

		// Empty route with missing attributes (TS should not allow it, but testing it anyway)
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			search: 'arrow left',
			short: false,
			page: 1,
		} as ParamType);
		expect(result).to.be.eql({
			search: 'arrow left',
			short: false,
			page: 1,
		});
	});

	it('routeParamsToObject(custom)', () => {
		type ParamType = CustomRouteParams;
		const routeType = 'custom';
		let result: PartialRouteParams;

		// Empty route
		result = routeParamsToObject(routeType, {
			// Type cannot be empty in real code, but check is done when view is
			// initialized or converted from object, not when exporting to object
			customType: '',
			filter: '',
			page: 0,
		} as ParamType);
		expect(result).to.be.eql({});

		// Empty route with missing attributes (TS should not allow it, but testing it anyway)
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore
		result = routeParamsToObject(routeType, {});
		expect(result).to.be.eql({});

		// Custom values for everything
		result = routeParamsToObject(routeType, {
			customType: 'recent',
			filter: 'arrow',
			page: 1,
		} as ParamType);
		expect(result).to.be.eql({
			customType: 'recent',
			filter: 'arrow',
			page: 1,
		});
	});
});
