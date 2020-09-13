/**
 * Placeholder, actual type is specific to components
 */
export type IconFinderComponentsConfig = Record<string, unknown>;

/**
 * Data stored in package.json's "configurator" field
 */
export interface ComponentsPackageInfo {
	exports: {
		// Command to build JavaScript files if they are missing
		build?: string;

		// Location of config JavaScript module that should export config() and merge()
		config: string;

		// Location of replacements JavaScript module that should export replacements()
		replacements: string;
	};

	config: {
		// Location of current config file
		current: string;

		// Location of last config file
		last: string;
	};
}
