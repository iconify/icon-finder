/**
 * TypeScript guard
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * Route types
 */
export type RouteType = 'collections' | 'collection' | 'search' | 'custom';

/**
 * Interfaces and default values
 */
// Collections list
export interface CollectionsRouteParams {
	filter: string; // Filter collections by keyword
	category: string | null; // Active category, null if none
}

export const collectionsRouteDefaults: CollectionsRouteParams = {
	filter: '',
	category: null,
};

// Collection
export interface CollectionRouteFilterParams {
	tag: string | null;
	themePrefix: string | null;
	themeSuffix: string | null;
}

export interface CollectionRouteParams extends CollectionRouteFilterParams {
	prefix: string; // Required prefix
	filter: string; // Search inside collection
	page: number; // Pagination
}

export const collectionRouteDefaults: CollectionRouteParams = {
	prefix: '',
	filter: '',
	page: 0,
	tag: null,
	themePrefix: null,
	themeSuffix: null,
};

// Search results
export interface SearchRouteParams {
	search: string; // Search keyword
	short: boolean; // True if previewing only few pages, false if showing all search results
	page: number; // Pagination
}

export const searchRouteDefaults: SearchRouteParams = {
	search: '',
	short: true,
	page: 0,
};

// Custom list
export interface CustomRouteParams {
	customType: string;
	filter: string; // Search inside custom icons list
	page: number; // Pagination
}

export const customRouteDefaults: CustomRouteParams = {
	customType: '',
	filter: '',
	page: 0,
};

// Combination of params
export type RouteParams =
	| CollectionsRouteParams
	| CollectionRouteParams
	| SearchRouteParams
	| CustomRouteParams;

export type PartialRouteParams = Partial<RouteParams>;

/**
 * Remove default values from route
 */
export const routeParamsToObject = (
	type: RouteType,
	params: RouteParams
): PartialRouteParams => {
	const result: Record<string, string | number | boolean> = {};
	let defaults;

	switch (type) {
		case 'collections':
			defaults = collectionsRouteDefaults;
			break;

		case 'collection':
			defaults = collectionRouteDefaults;
			break;

		case 'search':
			defaults = searchRouteDefaults;
			break;

		case 'custom':
			defaults = customRouteDefaults;
			break;

		default:
			assertNever(type);
			throw new Error(
				`Unknown route type in routeParamsToObject(): ${type}`
			);
	}

	let key: string;
	for (key in defaults) {
		const attr = key as keyof RouteParams;
		const value = params[attr];
		if (
			(typeof defaults[attr] !== 'object' &&
				typeof value === typeof defaults[attr] &&
				value !== defaults[attr]) || // same non-object type, different values
			(defaults[attr] === null && typeof value === 'string') // default is null, value is string
		) {
			result[key] = value;
		}
	}

	return result;
};

/**
 * List of parameters to change to lower case
 */
const toLowerCaseStrings = ['filter', 'search'];

/**
 * Convert object to RouteParams
 */
export const objectToRouteParams = (
	type: RouteType,
	params: PartialRouteParams
): RouteParams => {
	let defaults: RouteParams, result: RouteParams;

	if (params === null || typeof params !== 'object') {
		params = {};
	}

	const requiredStrings = [];

	switch (type) {
		case 'collections':
			defaults = collectionsRouteDefaults;
			result = {} as CollectionsRouteParams;
			break;

		case 'collection':
			requiredStrings.push('prefix');
			defaults = collectionRouteDefaults;
			result = {} as CollectionRouteParams;
			break;

		case 'search':
			requiredStrings.push('search');
			defaults = searchRouteDefaults;
			result = {} as SearchRouteParams;
			break;

		case 'custom':
			requiredStrings.push('customType');
			defaults = customRouteDefaults;
			result = {} as CustomRouteParams;
			break;

		default:
			assertNever(type);
			throw new Error(
				`Unknown route type in objectToRouteParams(): ${type}`
			);
	}

	// Copy default values
	result = Object.assign({}, defaults);

	let key: string;
	for (key in defaults) {
		const attr = key as keyof RouteParams;
		if (params[attr] === void 0) {
			// Missing parameter
			continue;
		}

		if (
			(defaults[attr] === null && typeof params[attr] === 'string') || // default = null, param = string
			(typeof defaults[attr] !== 'object' &&
				typeof defaults[attr] === typeof params[attr]) // non-object, matching type
		) {
			result[attr] = params[attr];
		}
	}

	// Validate required strings
	requiredStrings.forEach((key: string) => {
		const attr = key as keyof RouteParams;
		if (typeof result[attr] !== 'string' || result[attr] === '') {
			throw new Error(
				`Missing required route parameter "${key}" in objectToRouteParams()`
			);
		}
	});

	// Convert strings to lower case
	toLowerCaseStrings.forEach((key: string) => {
		const attr = key as keyof RouteParams;
		if (typeof result[attr] === 'string') {
			// "as never": hack to prevent typescript error in clearly simple code
			result[attr] = (result[attr] as string).toLowerCase() as never;
		}
	});

	return result;
};
