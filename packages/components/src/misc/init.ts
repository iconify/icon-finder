import { APIProviderRawData } from '@iconify/types/provider';
import { Registry, Route } from '@iconify/search-core';
// @iconify-replacement: './import-providers'
import { importProviders } from './import-providers';

// @iconify-replacement: 'customProviders: Record<string, APIProviderRawData> = {}'
const customProviders: Record<string, APIProviderRawData> = {};

// @iconify-replacement: 'defaultProvider = '''
const defaultProvider = '';

// @iconify-replacement: 'importProviders(customProviders);'
importProviders(customProviders);

/**
 * Initialise UI
 */
export function init(registry: Registry) {
	registry.router.defaultProvider = defaultProvider;
}
