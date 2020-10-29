import { cloneObject } from '../objects';

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

	// Components
	components?: Record<string, unknown>;
}

export type FullIconFinderConfig = Required<IconFinderConfig>;

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
	// Home route as string, empty to automatically detect route
	home: '',
};

/**
 * Default configuration.
 *
 * 2 levels deep object:
 * object[key][key2] = value
 */
const defaultConfig: FullIconFinderConfig = {
	// UI
	ui: defaultUIConfig,

	// Router
	router: defaultRouterConfig,

	// Components
	components: {},
};

/**
 * Set default components config
 */
export function setComponentsConfig(config: Record<string, unknown>): void {
	defaultConfig.components = Object.assign(config);
}

/**
 * Merge data
 */
export function mergeConfig(
	config: FullIconFinderConfig,
	custom: IconFinderConfig
): void {
	for (const key in custom) {
		const attr = key as keyof IconFinderConfig;
		const configSource = config[attr];
		if (configSource === void 0) {
			continue;
		}

		// Merge objects
		const customSource = custom[attr];
		for (const key2 in customSource) {
			const attr2 = key2 as keyof typeof configSource;
			if (configSource[attr2] !== void 0) {
				// Overwrite entry
				configSource[attr2] = customSource[attr2];
			}
		}
	}
}

/**
 * Create configuration object
 */
export function createConfig(
	customValues: IconFinderConfig = {}
): FullIconFinderConfig {
	const config = cloneObject(defaultConfig) as FullIconFinderConfig;
	if (customValues) {
		mergeConfig(config, customValues);
	}
	return config;
}

/**
 * Get customised configuration values
 */
export function customisedConfig(
	config: FullIconFinderConfig
): IconFinderConfig {
	const customised: IconFinderConfig = {};

	for (const key in config) {
		const attr = key as keyof IconFinderConfig;
		const defaultSource = defaultConfig[attr] as Record<string, unknown>;
		const configSource = config[attr] as Record<string, unknown>;
		const child: typeof configSource = {};
		let found = false;

		for (const key2 in configSource) {
			const attr2 = key2 as keyof typeof configSource;
			if (configSource[attr2] !== defaultSource[attr2]) {
				child[attr2] = configSource[attr2];
				found = true;
			}
		}

		if (found) {
			customised[attr] = child;
		}
	}

	return customised;
}
