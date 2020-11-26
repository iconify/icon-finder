// Common parameter for routes that are provider specific
export interface PartialProviderRouteParams {
	provider?: string;
}

/**
 * Collections list route params
 */
export interface PartialCollectionsRouteParams
	extends PartialProviderRouteParams {
	filter?: string; // Filter collections by keyword
	category?: string | null; // Active category, null if none
}

export type FullCollectionsRouteParams = Required<
	PartialCollectionsRouteParams
>;

/**
 * Collection view route params
 */
export interface PartialCollectionRouteFilterParams {
	tag?: string | null;
	themePrefix?: string | null;
	themeSuffix?: string | null;
}

export interface PartialCollectionRouteParams
	extends PartialCollectionRouteFilterParams,
		PartialProviderRouteParams {
	prefix: string; // Required prefix
	filter?: string; // Search inside collection
	icon?: string; // Reference icon, used to show next/previous icon or change pagination
	page?: number; // Pagination
}

export type FullCollectionRouteParams = Required<PartialCollectionRouteParams>;

/**
 * Search results route params
 */
export interface PartialSearchRouteParams extends PartialProviderRouteParams {
	search: string; // Required search keyword
	short?: boolean; // True if previewing only few pages, false if showing all search results
	page?: number; // Pagination
}

export type FullSearchRouteParams = Required<PartialSearchRouteParams>;

/**
 * Custom view route params
 */
export interface PartialCustomRouteParams {
	customType: string; // Required custom view type
	filter?: string; // Search inside custom icons list
	page?: number; // Pagination
}

export type FullCustomRouteParams = Required<PartialCustomRouteParams>;

/**
 * Empty route params
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PartialEmptyRouteParams {
	//
}

export type FullEmptyRouteParams = Required<PartialEmptyRouteParams>;
