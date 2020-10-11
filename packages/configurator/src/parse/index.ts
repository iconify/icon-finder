import { ConfiguratorParams } from '../params/type';
import { IconFinderConfig, StoredIconFinderConfig } from '../config/full';
import { loadConfigFromParams } from './configs';
import { loadCommonConfig } from './common';
import { rebuildCore } from './rebuild';
import {
	loadComponentsConfig,
	loadReplacements,
	compareLastStoredConfig,
	storeConfig,
	rebuildComponents,
} from './components';
import { loadThemeConfig, locateThemeFile } from './theme';
import { getCustomFiles, CustomFiles } from './custom-files';

/**
 * Result
 */
export interface ParseResult extends IconFinderConfig, StoredIconFinderConfig {
	stylesheet: string;
	rebuilt: boolean;
}

/**
 * Parse stuff
 */
export function parse(
	params: ConfiguratorParams,
	currentDir?: string
): ParseResult {
	// Rebuild core if needed
	if (params.rebuild.core) {
		if (params.verbose) {
			console.log('Rebuilding core');
		}
		rebuildCore();

		// Mark components for rebuild
		params.rebuild.components = true;
	}

	// Convert params to list of configiration objects
	const configList = loadConfigFromParams(params);

	// Load common configration
	const commonConfig = loadCommonConfig(configList);

	// Add current directory
	if (
		typeof currentDir === 'string' &&
		typeof commonConfig.components.customDir === 'string' &&
		commonConfig.components.customDir.slice(0, 1) !== '/'
	) {
		commonConfig.components.customDir =
			currentDir + '/' + commonConfig.components.customDir;
	}

	// Load components config
	const componentsConfig = loadComponentsConfig(
		commonConfig.components.package,
		configList
	);

	// Load theme config
	const themeConfig = loadThemeConfig(commonConfig.theme, configList, params);

	// Get list of custom files
	let customFiles: CustomFiles | null = null;
	if (
		typeof commonConfig.components.customDir === 'string' &&
		commonConfig.components.customDir !== ''
	) {
		customFiles = getCustomFiles(commonConfig.components.customDir);
	}

	// Generate full config
	const fullConfig: IconFinderConfig = {
		common: commonConfig,
		components: componentsConfig,
		theme: themeConfig,
	};

	// Get replacements
	if (params.debug) {
		console.log(
			`Loading replacements for components, using package ${commonConfig.components.package}. Config used as input:`
		);
		console.log(JSON.stringify(fullConfig, null, 2));
	}
	const replacements = loadReplacements(
		commonConfig.components.package,
		fullConfig,
		customFiles
	);

	// Combine it all to big config file
	const storedConfig: StoredIconFinderConfig = {
		replacements,
		customFiles,
	};

	// Validate last stored config if components don't require rebuilding
	if (
		!params.rebuild.components &&
		!compareLastStoredConfig(commonConfig.components.package, storedConfig)
	) {
		// Config changed - rebuild components
		params.rebuild.components = true;
	}

	// Rebuild components
	if (params.rebuild.components) {
		// Store config used for rebuilding
		if (params.debug) {
			console.log('Custom configuration for components:');
			console.log(JSON.stringify(storedConfig, null, 2));
		}
		storeConfig(commonConfig.components.package, storedConfig, 'current');

		// Rebuild components
		if (params.verbose) {
			console.log('Rebuilding components');
		}
		rebuildComponents(commonConfig.components.package);

		// Store config for comparison
		storeConfig(commonConfig.components.package, storedConfig, 'last');
	}

	// Return data
	return {
		// IconFinderConfig
		common: commonConfig,
		components: componentsConfig,
		theme: themeConfig,

		// StoredIconFinderConfig
		replacements,
		customFiles,

		// Components rebuild status
		rebuilt: params.rebuild.components,

		// Stylesheet location
		stylesheet: locateThemeFile(commonConfig.theme, 'stylesheet'),
	};
}
