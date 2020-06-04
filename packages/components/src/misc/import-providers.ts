import { APIProviderRawData } from '@iconify/types/provider';
import { convertProviderData, addProvider } from '@iconify/search-core';

/**
 * Import custom providers
 */
export function importProviders(
	providers: Record<string, APIProviderRawData>
): void {
	Object.keys(providers).forEach((provider) => {
		const item = providers[provider];
		item.provider = provider;
		const data = convertProviderData('', item);
		if (data) {
			addProvider(item.provider, data);
		}
	});
}
