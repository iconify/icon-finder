import Iconify, { IconifyAPIConfig } from '@iconify/iconify';
import { Redundancy } from '@cyberalien/redundancy';

/**
 * API provider interface
 */
// Common fields
interface APIProviderData {
	name: string;
}

// Interface with API configuration
export interface APIProviderSource extends APIProviderData {
	config: Partial<IconifyAPIConfig>;
}

// Interface with Redundancy instance
export interface APIProviderConfigured extends APIProviderData {
	config: IconifyAPIConfig;
	redundancy: Redundancy;
}

/**
 * Local cache
 */
const sourceCache: Record<string, APIProviderSource> = Object.create(null);
const configuredCache: Record<
	string,
	APIProviderConfigured | null
> = Object.create(null);

// Add default provider
sourceCache[''] = {
	config: {},
	name: 'Iconify',
};

/**
 * Defaults
 */
const defaults: APIProviderData = {
	name: '',
};

/**
 * Get API provider
 */
export function getProvider(provider: string): APIProviderConfigured | null {
	if (configuredCache[provider] === void 0) {
		if (sourceCache[provider] === void 0) {
			// Missing provider
			return null;
		}

		const source = sourceCache[provider];

		// Get Redundancy instance from Iconify
		const data = Iconify._getInternalAPI(provider);
		if (data === void 0) {
			// Failed again - something is wrong with config
			configuredCache[provider] = null;
		} else {
			configuredCache[provider] = {
				config: data.config,
				redundancy: data.redundancy,
			} as APIProviderConfigured;

			// Add missing fields
			const cache = configuredCache[provider] as APIProviderConfigured;
			for (const key in defaults) {
				const attr = key as keyof APIProviderData;
				if (source[attr] !== void 0) {
					cache[attr] = source[attr];
				} else {
					cache[attr] = defaults[attr];
				}
			}
		}
	}

	return configuredCache[provider];
}

/**
 * Add provider
 */
export function addProvider(provider: string, config: APIProviderSource): void {
	if (sourceCache[provider] !== void 0) {
		// Cannot overwrite provider
		return;
	}
	if (config.name === void 0) {
		// Use provider as name
		config.name = provider;
	}
	sourceCache[provider] = config;
	Iconify.addAPIProvider(provider, config.config);
}

/**
 * Get all providers
 */
export function listProviders(): string[] {
	return Object.keys(sourceCache).sort();
}
