import {
	RouteParams,
	CollectionsRouteParams,
	CollectionRouteParams,
	SearchRouteParams,
	CustomRouteParams,
	routeParamsToObject,
	objectToRouteParams,
} from './params';

/**
 * Route types
 */
export type RouteType = 'collections' | 'collection' | 'search' | 'custom';

const routeTypes: string[] = ['collections', 'collection', 'search', 'custom'];

/**
 * Route interfaces
 */
interface CommonRoute {
	parent: Route | null;
}

export interface CollectionsRoute extends CommonRoute {
	readonly type: 'collections';
	params: CollectionsRouteParams;
}

export interface CollectionRoute extends CommonRoute {
	readonly type: 'collection';
	params: CollectionRouteParams;
}

export interface SearchRoute extends CommonRoute {
	readonly type: 'search';
	params: SearchRouteParams;
}

export interface CustomRoute extends CommonRoute {
	readonly type: 'custom';
	params: CustomRouteParams;
}

export type Route =
	| CollectionsRoute
	| CollectionRoute
	| SearchRoute
	| CustomRoute;

/**
 * Partial route that can be missing attributes or could be null
 *
 * Route can be missing attributes, so it is normalised before use
 */
export type PartialRoute = Partial<Route> | null;

/**
 * Convert route to object for export, ignoring default values
 */
export const routeToObject = (route: Route): PartialRoute => {
	const result: NonNullable<PartialRoute> = {
		type: route.type,
	};

	const params = routeParamsToObject(route.type, route.params);
	if (Object.keys(params).length > 0) {
		result.params = params as RouteParams;
	}

	if (route.parent) {
		const parent = routeToObject(route.parent) as PartialRoute;
		if (parent !== null) {
			result.parent = parent as Route;
		}
	}

	return result;
};

/**
 * Check if route type is valid
 */
const isValidRouteType = (type: string): boolean => {
	return typeof type === 'string' && routeTypes.indexOf(type) !== -1;
};

/**
 * Convert object to Route, adding missing values
 */
export const objectToRoute = (
	data: PartialRoute,
	defaultRoute: Route | null = null
): Route | null => {
	// Check for valid object
	if (data === null || typeof data !== 'object') {
		return defaultRoute;
	}

	// Convert data to Route and validate route type
	const params = data as Route;
	if (!isValidRouteType(params.type)) {
		return defaultRoute;
	}

	// Validate parent route
	let parent: Route | null = null;
	if (typeof params.parent === 'object' && params.parent !== null) {
		parent = objectToRoute(params.parent, null);
		if (parent === null) {
			// Error loading parent route
			return defaultRoute;
		}
	}

	// Check route parameters
	let routeParams: RouteParams;
	try {
		routeParams = objectToRouteParams(
			params.type,
			typeof params.params === 'object' && params.params
				? params.params
				: {}
		);
	} catch (err) {
		return defaultRoute;
	}

	// Create route
	const route = {
		type: params.type,
		params: routeParams,
		parent: parent,
	};

	// Convert route to correct type
	switch (params.type) {
		case 'collections':
			return route as CollectionsRoute;

		case 'collection':
			return route as CollectionRoute;

		case 'search':
			return route as SearchRoute;

		case 'custom':
			return route as CustomRoute;

		default:
			throw new Error(
				`Unknown route type in objectToRoute(): ${route.type}`
			);
	}
};
