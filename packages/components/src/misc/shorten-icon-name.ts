import { Route, Icon, CollectionRouteParams } from '@iconify/search-core';

export function shortenIconName(
	route: Route,
	selectedIcon: Icon,
	fullName: string
): string {
	if (!selectedIcon || !route) {
		return fullName;
	}

	let checkPrefix = false;
	switch (route.type) {
		case 'collections':
		case 'search':
			// Hide only provider
			break;

		case 'collection':
			// Hide prefix if identical
			checkPrefix = true;
			break;

		default:
			return fullName;
	}
	const params = route.params;

	// Get and check provider
	const provider =
		params && typeof params.provider === 'string' ? params.provider : '';
	if (selectedIcon.provider !== provider) {
		return fullName;
	}

	// Check if icon has same prefix (only for collection)
	if (
		checkPrefix &&
		selectedIcon.prefix === (params as CollectionRouteParams).prefix
	) {
		return selectedIcon.name;
	}
	return selectedIcon.prefix + ':' + selectedIcon.name;
}
