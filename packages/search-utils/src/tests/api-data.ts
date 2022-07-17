import { _api, addAPIProvider } from 'iconify-icon';
import { nextProvider } from './helpers';
import { mockAPIModule } from './api-mock';
import type { StoredIconFinderSearchQuery } from '../data/search/types/storage';

/**
 * URI for collections list
 */
export function collectionsAPIURI() {
	return '/collections?hidden=true';
}

/**
 * URI for icon set
 */
export function iconSetAPIURI(prefix: string): string {
	const urlParams = new URLSearchParams({
		prefix,
		aliases: 'true',
		hidden: 'true',
	});
	return '/collection?' + urlParams.toString();
}

/**
 * URI for search
 */
export function searchAPIURI(query: StoredIconFinderSearchQuery): string {
	const { keyword, limit, category, prefixes } = query;
	const urlParams = new URLSearchParams({
		query: keyword,
		limit: limit.toString(),
	});
	if (category) {
		urlParams.set('category', category);
	}
	if (prefixes) {
		urlParams.set('prefixes', prefixes.join(','));
	}
	return '/search?' + urlParams.toString();
}

/**
 * Get API provider and set mock
 */
export function nextMockedAPIProvider() {
	const provider = nextProvider();
	addAPIProvider(provider, {
		resources: ['https://localhost'],
	});
	_api.setAPIModule(provider, mockAPIModule);

	// Return both provider and function to mock data as workaround for Vitest bug: importing mockAPIData
	// in tests somehow results in different instance of imported file in CommonJS tests
	return provider;
}
