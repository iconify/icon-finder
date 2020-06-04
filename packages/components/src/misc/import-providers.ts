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
		const host = (item.api instanceof Array
			? item.api[0]
			: item.api) as string;
		const data = convertProviderData(host, item);
		if (data) {
			addProvider(item.provider, data);
		}
	});
}
