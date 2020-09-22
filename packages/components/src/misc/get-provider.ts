import { CollectionRouteParams, Route } from '@iconify/search-core';

/**
 * Get active provider from route
 */
export function getActiveProvider(route: Route): string {
	if (!route) {
		return '';
	}

	const params = route.params as CollectionRouteParams;
	if (params && typeof params.provider === 'string') {
		return params.provider;
	}
	if (route.parent) {
		return getActiveProvider(route.parent);
	}
	return '';
}
