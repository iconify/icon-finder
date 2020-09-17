import { IconFinderConfig } from '../config/full';

// Type for one entry
type CustomConfig = Record<string, unknown>;

// Type to convert IconFinderConfig to array of objects
type Convert<T> = Record<keyof T, CustomConfig[]>;

// Type for result
export type CustomConfigs = Convert<IconFinderConfig>;

/**
 * Params type
 */
export interface ConfiguratorParams {
	// Config file(s) to load
	configFiles: string[];

	// Custom configuration
	config: CustomConfigs;

	// Custom theme
	theme?: string;

	// Rebuild
	rebuild: {
		core: boolean;
		theme: boolean;
		components: boolean;
	};

	// Log stuff
	verbose?: boolean; // Basic logging
	debug?: boolean; // Full logging. If enabled, also enables verbose
}
