import type {
	FullCollectionsRouteParams,
	FullCollectionRouteParams,
	FullCustomRouteParams,
	FullSearchRouteParams,
	PartialCollectionsRouteParams,
	PartialCollectionRouteParams,
	PartialSearchRouteParams,
	PartialCustomRouteParams,
	FullEmptyRouteParams,
	PartialEmptyRouteParams,
} from './types/params';

/**
 * Default values for route parameters
 */
export const collectionsRouteDefaults: FullCollectionsRouteParams = {
	provider: '',
	filter: '',
	category: null,
};

export const collectionRouteDefaults: FullCollectionRouteParams = {
	provider: '',
	prefix: '',
	filter: '',
	page: 0,
	tag: null,
	themePrefix: null,
	themeSuffix: null,
};

export const searchRouteDefaults: FullSearchRouteParams = {
	provider: '',
	search: '',
	short: true,
	page: 0,
};

export const customRouteDefaults: FullCustomRouteParams = {
	customType: '',
	filter: '',
	page: 0,
};

export const emptyRouteDefaults: FullEmptyRouteParams = {};

/**
 * Partial default values, used to validate parameters in partial routes
 */
export const collectionsRouteMinimum: PartialCollectionsRouteParams = {};

export const collectionRouteMinimum: PartialCollectionRouteParams = {
	prefix: '',
};

export const searchRouteMinimum: PartialSearchRouteParams = {
	search: '',
};

export const customRouteMinimum: PartialCustomRouteParams = {
	customType: '',
};

export const emptyRouteMinimum: PartialEmptyRouteParams = {};
