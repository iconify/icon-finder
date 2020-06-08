import {
	APIProviderRawDataLinks,
	APIProviderRawDataNPM,
	APIProviderRawData,
} from '@iconify/types/provider';
import Iconify, { IconifyAPIConfig } from '@iconify/iconify';
import { Redundancy } from '@cyberalien/redundancy';
import { match } from '../icon';

// Export imported types
export { APIProviderRawDataLinks, APIProviderRawDataNPM, APIProviderRawData };

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * Default values
 */
const defaultAPIDataLinks: Required<APIProviderRawDataLinks> = {
	home: '',
	collection: '',
	icon: '',
};

const defaultAPIDataNPM: Required<APIProviderRawDataNPM> = {
	package: '',
	icon: '',
};

const defaultAPIData: Required<APIProviderRawData> = {
	// These variables will be automatically set if empty
	provider: '',
	title: '',
	api: '',

	// Optional
	links: defaultAPIDataLinks,
	npm: defaultAPIDataNPM,
};

/**
 * API provider interface
 */
// Common fields
interface APIProviderData {
	title: string;
	links: Required<APIProviderRawDataLinks>;
	npm: Required<APIProviderRawDataNPM>;
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
const iconifyRoot = 'https://iconify.design/icon-sets/';
const iconifyPackage = '@iconify/icons-{prefix}';
sourceCache[''] = {
	config: {},
	title: 'Iconify',
	links: {
		home: iconifyRoot,
		collection: iconifyRoot + '{prefix}/',
		icon: iconifyRoot + '{prefix}/{name}.html',
	},
	npm: {
		package: iconifyPackage,
		icon: iconifyPackage + '/{name}',
	},
};

/**
 * Defaults
 */
const defaults: APIProviderData = {
	title: '',
	links: defaultAPIDataLinks,
	npm: defaultAPIDataNPM,
};

/**
 * Convert data returned from API
 */
export function convertProviderData(
	host: string,
	raw: APIProviderRawData
): APIProviderSource | null {
	const provider = raw.provider;
	if (
		typeof provider !== 'string' ||
		// Allow empty string
		(provider !== '' && !provider.match(match))
	) {
		return null;
	}

	// Clean up raw data
	const data: Partial<APIProviderRawData> = {};
	for (const key in defaultAPIData) {
		const attr = key as keyof APIProviderRawData;

		// Vars for npm/links
		let defaultValue: APIProviderRawDataLinks;
		let resultValue: APIProviderRawDataLinks;

		switch (attr) {
			case 'title':
				data.title =
					typeof raw.title === 'string' ? raw.title : provider;
				break;

			case 'provider':
				data.provider = provider;
				break;

			case 'api':
				if (typeof raw.api === 'string' && raw.api !== '') {
					data.api = [raw.api];
				} else if (raw.api instanceof Array) {
					data.api = raw.api;
				} else if (host === '') {
					// Missing host
					return null;
				} else {
					data.api = [host];
				}
				break;

			case 'npm':
			case 'links':
				defaultValue = defaultAPIData[attr] as APIProviderRawDataLinks;

				if (typeof raw[attr] !== 'object' || !raw[attr]) {
					// Copy default value
					resultValue = defaultValue;
				} else {
					const rawValue = raw[attr] as APIProviderRawDataLinks;

					// Merge values
					resultValue = {};
					for (const nestedKey in defaultValue) {
						const nestedAttr = nestedKey as keyof APIProviderRawDataLinks;
						if (typeof rawValue[nestedAttr] === 'string') {
							resultValue[nestedAttr] = rawValue[nestedAttr];
						} else {
							resultValue[nestedAttr] = defaultValue[nestedAttr];
						}
					}
				}
				data[attr] = resultValue;
				break;

			default:
				assertNever(attr);
		}
	}
	const fullData = data as Required<APIProviderRawData>;

	// Create API config
	const config: Partial<IconifyAPIConfig> = {
		resources: fullData.api as string[],
	};

	// Create data
	const result: APIProviderSource = {
		config,
		title: fullData.title,
		links: fullData.links as Required<APIProviderRawDataLinks>,
		npm: fullData.npm as Required<APIProviderRawDataNPM>,
	};

	return result;
}

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
		const data = Iconify._internal.getAPI(provider);
		if (data === void 0) {
			// Failed again - something is wrong with config
			configuredCache[provider] = null;
		} else {
			configuredCache[provider] = {
				config: data.config,
				redundancy: data.redundancy,
			} as APIProviderConfigured;

			// Add missing fields
			const cache = (configuredCache[provider] as unknown) as Record<
				string,
				unknown
			>;
			const src = (source as unknown) as Record<string, unknown>;
			for (const key in defaults) {
				if (src[key] !== void 0) {
					cache[key] = src[key];
				} else {
					cache[key] = ((defaults as unknown) as Record<
						string,
						unknown
					>)[key];
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
	if (config.title === void 0) {
		// Use provider as name
		config.title = provider;
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
