import type {
	PartialCollectionsRouteParams,
	PartialCollectionRouteParams,
	PartialSearchRouteParams,
	PartialCustomRouteParams,
	PartialEmptyRouteParams,
	FullCollectionsRouteParams,
	FullCollectionRouteParams,
	FullSearchRouteParams,
	FullCustomRouteParams,
	FullEmptyRouteParams,
} from './params';

/**
 * Route types
 */
export type RouteType =
	| 'collections'
	| 'collection'
	| 'search'
	| 'custom'
	| 'empty';

/**
 * Base route
 */
interface PartialCommonRoute {
	readonly type: RouteType;
	parent?: PartialRoute | null;
}

interface FullCommonRoute {
	readonly type: RouteType;
	parent: FullRoute | null;
}

/**
 * Collections list
 */
export interface PartialCollectionsRoute extends PartialCommonRoute {
	type: 'collections';
	// No required parameters
	params?: PartialCollectionsRouteParams;
}

export interface FullCollectionsRoute extends FullCommonRoute {
	type: 'collections';
	params: FullCollectionsRouteParams;
}

/**
 * Collection view
 */
export interface PartialCollectionRoute extends PartialCommonRoute {
	type: 'collection';
	params: PartialCollectionRouteParams;
}

export interface FullCollectionRoute extends FullCommonRoute {
	type: 'collection';
	params: FullCollectionRouteParams;
}

/**
 * Search results
 */
export interface PartialSearchRoute extends PartialCommonRoute {
	type: 'search';
	params: PartialSearchRouteParams;
}

export interface FullSearchRoute extends FullCommonRoute {
	type: 'search';
	params: FullSearchRouteParams;
}

/**
 * Custom view
 */
export interface PartialCustomRoute extends PartialCommonRoute {
	type: 'custom';
	params: PartialCustomRouteParams;
}

export interface FullCustomRoute extends FullCommonRoute {
	type: 'custom';
	params: FullCustomRouteParams;
}

/**
 * Empty
 */
export interface PartialEmptyRoute extends PartialCommonRoute {
	type: 'empty';
	// No required parameters
	params?: PartialEmptyRouteParams;
}

export interface FullEmptyRoute extends FullCommonRoute {
	type: 'empty';
	params: FullEmptyRouteParams;
}

/**
 * Unions
 */
export type PartialRoute =
	| PartialCollectionsRoute
	| PartialCollectionRoute
	| PartialSearchRoute
	| PartialCustomRoute
	| PartialEmptyRoute;

export type FullRoute =
	| FullCollectionsRoute
	| FullCollectionRoute
	| FullSearchRoute
	| FullCustomRoute
	| FullEmptyRoute;
