import {
	collectionsRouteDefaults,
	collectionsRouteMinimum,
	collectionRouteDefaults,
	collectionRouteMinimum,
	searchRouteDefaults,
	searchRouteMinimum,
	customRouteDefaults,
	customRouteMinimum,
	emptyRouteDefaults,
	emptyRouteMinimum,
} from './defaults';
import type { RouteType, FullRoute, PartialRoute } from './types/routes';

/**
 * TypeScript guard
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

// Simple object
type CommonRouteParams = Record<string, unknown>;

interface GetValuesResult {
	defaults: CommonRouteParams;
	required: CommonRouteParams;
}

/**
 * Get required and default values
 */
function getValues(type: RouteType): GetValuesResult {
	let defaults: CommonRouteParams;
	let required: CommonRouteParams;

	switch (type) {
		case 'collections':
			defaults = collectionsRouteDefaults;
			required = collectionsRouteMinimum as CommonRouteParams;
			break;

		case 'collection':
			defaults = collectionRouteDefaults;
			required = (collectionRouteMinimum as unknown) as CommonRouteParams;
			break;

		case 'search':
			defaults = searchRouteDefaults;
			required = (searchRouteMinimum as unknown) as CommonRouteParams;
			break;

		case 'custom':
			defaults = customRouteDefaults;
			required = (customRouteMinimum as unknown) as CommonRouteParams;
			break;

		case 'empty':
			defaults = emptyRouteDefaults;
			required = (emptyRouteMinimum as unknown) as CommonRouteParams;
			break;

		default:
			assertNever(type);
			throw new Error(`Unknown route type: ${type}`);
	}

	return {
		defaults,
		required,
	};
}

/**
 * Remove default values from route
 */
export const routeParamsToObject = (
	type: RouteType,
	params: CommonRouteParams
): CommonRouteParams => {
	const result: CommonRouteParams = {};
	const { defaults, required } = getValues(type);

	for (const key in defaults) {
		const value = params[key];
		if (
			// Save value if it is required
			required[key] !== void 0 ||
			// Save value if it is different
			value !== defaults[key]
		) {
			result[key] = value;
		}
	}

	return result;
};

/**
 * Convert route to object for export, ignoring default values
 */
export const routeToObject = (route: FullRoute): PartialRoute => {
	const result: PartialRoute = {
		type: route.type,
	} as PartialRoute;

	const params = routeParamsToObject(route.type, route.params);
	if (Object.keys(params).length > 0) {
		result.params = params;
	}

	if (route.parent) {
		const parent = routeToObject(route.parent) as PartialRoute;
		if (parent) {
			result.parent = parent;
		}
	}

	return result;
};

/**
 * List of parameters to change to lower case
 */
const toLowerCaseStrings = ['filter', 'search', 'provider'];

/**
 * Convert object to RouteParams
 */
export const objectToRouteParams = (
	type: RouteType,
	params: CommonRouteParams
): CommonRouteParams => {
	const result: CommonRouteParams = {};
	const { defaults, required } = getValues(type);

	// Check for required properties
	for (const key in required) {
		if (
			typeof params[key] !== typeof required[key] ||
			params[key] === required[key]
		) {
			// Cannot have different type or empty value
			throw new Error(
				`Missing required route parameter "${key}" in objectToRouteParams()`
			);
		}
	}

	// Copy all values
	for (const key in defaults) {
		const defaultValue = defaults[key];
		if (params[key] === void 0) {
			// Use default
			result[key] = defaultValue;
			continue;
		}

		let value = params[key];
		const allowedType =
			defaultValue === null ? 'string' : typeof defaultValue;
		if (typeof value === allowedType) {
			// Matching type
			if (
				allowedType === 'string' &&
				toLowerCaseStrings.indexOf(key) !== -1
			) {
				// Change to lower case
				value = (value as string).toLowerCase();
			}
			result[key] = value;
			continue;
		}

		// Exception: null where default value is not null
		if (value === null) {
			if (key === 'page' && type === 'collection') {
				result[key] = value;
				continue;
			}
		}

		// Invalid value
		result[key] = defaultValue;
	}

	return result;
};

/**
 * Convert object to Route, adding missing values
 */
export const objectToRoute = (
	data: PartialRoute,
	defaultRoute: FullRoute | null = null
): FullRoute | null => {
	// Check for valid object
	if (
		data === null ||
		typeof data !== 'object' ||
		typeof data.type !== 'string'
	) {
		return defaultRoute;
	}

	// Check if route is valid
	const type = data.type;
	switch (type) {
		case 'collections':
		case 'collection':
		case 'custom':
		case 'search':
		case 'empty':
			break;

		default:
			assertNever(type);
			return defaultRoute;
	}

	// Get parameters
	let params: CommonRouteParams;
	try {
		params = objectToRouteParams(
			type,
			typeof data.params === 'object'
				? (data.params as CommonRouteParams)
				: {}
		);
	} catch (err) {
		return defaultRoute;
	}

	// Get parent
	let parent: FullRoute | null = null;
	if (typeof data.parent === 'object' && data.parent !== null) {
		parent = objectToRoute(data.parent, null);
		if (parent === null) {
			// Error in child route
			return defaultRoute;
		}
	}

	// Return result
	return {
		type,
		params,
		parent,
	} as FullRoute;
};
