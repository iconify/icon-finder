import { APIProviderRawData } from '@iconify/types/provider';

/**
 * Theme package data
 */
export interface IconFinderCommonThemeConfig {
	// Theme package
	package: string;

	// Theme name, if exists within a package
	name?: string;
}

/**
 * Components package data
 */
export interface IconFinderCommonComponentsConfig {
	// Components package
	package: string;

	// Directory with custom files to merge with components
	customDir?: string;
}

/**
 * Common configuration
 */
export interface IconFinderCommonConfig {
	// Theme stuff
	theme: IconFinderCommonThemeConfig;

	// Components stuff
	components: IconFinderCommonComponentsConfig;

	// API providers
	providers: {
		show: boolean;

		// Can add providers
		canAdd: boolean;

		// Default provider name
		default: string;

		// Custom providers list
		custom: Record<string, APIProviderRawData>;
	};
}

/**
 * Get default configuration values
 */
export function config(): IconFinderCommonConfig {
	return {
		// Theme stuff
		theme: {
			package: '@iconify/search-themes',
		},

		// Components stuff
		components: {
			package: '@iconify/search-components',
		},

		// API providers
		providers: {
			show: false,
			canAdd: false,
			default: '',
			custom: Object.create(null),
		},
	};
}

/**
 * Merge values from default config and custom config
 *
 * This function returns value only if values should be merged in a custom way, such as making sure some objects don't mix
 * Returns undefined if default merge method should be used.
 */
export function merge<T>(
	path: string,
	defaultValue: T,
	customValue: T
): T | void {
	switch (path) {
		case 'providers.custom':
			// Merge custom providers
			return Object.assign(
				Object.create(null),
				defaultValue,
				customValue
			);
	}
}
