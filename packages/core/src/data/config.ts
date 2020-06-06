import { cloneObject } from '../objects';
import { setData, DataStorage, customisedData } from '.';

/**
 * UI config
 */
export interface IconFinderUIConfig {
	// Number of icons per page.
	itemsPerPage?: number;

	// Maximum delay between changing current view and updating visible view.
	// This delay is used to avoid "loading" page when changing views.
	viewUpdateDelay?: number;

	// Number of sibling collections to show when collection view is child view of collections list.
	showSiblingCollections?: number;
}

/**
 * Router config
 */
export interface IconFinderRouterConfig {
	// Home route as string
	home?: string;
}

/**
 * Combined config
 */
export interface IconFinderConfig {
	// UI
	ui?: IconFinderUIConfig;

	// Router
	router?: IconFinderRouterConfig;
}

/**
 * Default UI config
 */
const defaultUIConfig: Required<IconFinderUIConfig> = {
	// Number of icons per page.
	itemsPerPage: 52,

	// Maximum delay between changing current view and updating visible view.
	// This delay is used to avoid "loading" page when changing views.
	viewUpdateDelay: 300,

	// Number of sibling collections to show when collection view is child view of collections list.
	showSiblingCollections: 2,
};

/**
 * Router config
 */
const defaultRouterConfig: Required<IconFinderRouterConfig> = {
	// Home route as string
	home: JSON.stringify({
		type: 'collections',
	}),
};

/**
 * Default configuration.
 *
 * 2 levels deep object:
 * object[key][key2] = value
 */
const defaultConfig: Required<IconFinderConfig> = {
	// UI
	ui: defaultUIConfig,

	// Router
	router: defaultRouterConfig,
};

/**
 * Create configuration object
 */
export function createConfig(
	customValues: IconFinderConfig = {}
): IconFinderConfig {
	const config: IconFinderConfig = cloneObject(
		defaultConfig
	) as IconFinderConfig;
	if (customValues) {
		setData(config as DataStorage, customValues as DataStorage);
	}
	return config;
}

/**
 * Get customised configuration values
 */
export function customisedConfig(config: IconFinderConfig): IconFinderConfig {
	return customisedData(
		config as DataStorage,
		(defaultConfig as unknown) as DataStorage
	) as IconFinderConfig;
}
