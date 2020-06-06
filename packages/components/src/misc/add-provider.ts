import { APIProviderRawData } from '@iconify/types/provider';
import {
	Registry,
	convertProviderData,
	addProvider,
	APIProviderSource,
} from '@iconify/search-core';

/**
 * Validate API provider host
 */
export function validateProvider(url: string): string | null {
	let parts = url.toLowerCase().split('/');

	// Check protocol
	const protocol = parts.shift();
	switch (protocol) {
		case 'http:':
		case 'https:':
			break;

		default:
			return null;
	}

	// Double '/'
	if (parts.shift() !== '') {
		return null;
	}

	// Host
	const host = parts.shift();
	if (typeof host !== 'string') {
		return null;
	}
	const hostParts = host.split(':');
	if (hostParts.length > 2) {
		return null;
	}

	// Validate domain
	const domain = hostParts.shift();
	if (!domain || !domain.match(/^[a-z0-9.-]+$/)) {
		return null;
	}

	// Validate port
	const port = hostParts.shift();
	if (port !== void 0 && !port.match(/^[0-9]+$/)) {
		return null;
	}

	// Return protocol + host, ignore the rest
	return protocol + '//' + host;
}

/**
 * Type for callback
 */
export type RetrieveProviderCallback = (
	host: string,
	success: boolean,
	provider: string
) => void;

/**
 * Retrieve API provider data
 */
export function retrieveProvider(
	registry: Registry,
	host: string,
	callback: RetrieveProviderCallback
): void {
	const api = registry.api;
	api.sendQuery(host, '/provider', (status, data) => {
		const providerData = data as APIProviderRawData;
		let convertedData: APIProviderSource | null;
		switch (status) {
			case 'success':
				if (
					typeof providerData !== 'object' ||
					typeof providerData.provider !== 'string'
				) {
					break;
				}
				convertedData = convertProviderData(host, providerData);
				if (!convertedData) {
					console.log('Failed to convert data');
					break;
				}
				const provider = providerData.provider;
				addProvider(provider, convertedData);
				callback(host, true, provider);
				return;
		}
		callback(host, false, 'error');
	});
}
