import { readFileSync, writeFileSync } from 'fs';
import { LoadedConfigs } from './configs';
import { merge as mergeObjects } from '../config/merge';
import { findPackage } from '../find-package';
import {
	ComponentsPackageInfo,
	IconFinderComponentsConfig,
} from '../config/components';
import { fileExists } from '../file-exists';
import { exec } from './rebuild';
import { IconFinderConfig, StoredIconFinderConfig } from '../config/full';
import { compareObjects } from '../objects';
import { CustomFiles } from './custom-files';

/**
 * Default package.info data
 */
const defaultPackageInfo: ComponentsPackageInfo = {
	exports: {
		config: '',
		replacements: '',
	},
	config: {
		current: '',
		last: '',
	},
};

/**
 * Load component information from package.json
 */
function loadComponentInfo(packageName: string): ComponentsPackageInfo {
	const dir = findPackage(packageName);

	// Read package.json
	let packageData: Record<string, unknown>;
	try {
		packageData = JSON.parse(readFileSync(dir + '/package.json', 'utf8'));
	} catch (err) {
		//
	}
	if (typeof packageData !== 'object') {
		throw new Error(`Could not locate package.json for ${packageName}`);
	}
	if (typeof packageData.configurator !== 'object') {
		throw new Error(
			`File package.json in ${packageName} does not contain configurator metadata`
		);
	}

	// Get info and validate it
	let info = packageData.configurator as ComponentsPackageInfo;
	Object.keys(defaultPackageInfo).forEach((key) => {
		if (typeof info[key] !== 'object') {
			throw new Error(
				`File package.json in ${packageName} is missing configurator property "${key}"`
			);
		}

		Object.keys(defaultPackageInfo[key]).forEach((key2) => {
			if (typeof info[key][key2] !== 'string') {
				throw new Error(
					`File package.json in ${packageName} is missing configurator property "${key}.${key2}"`
				);
			}
		});
	});

	// Check if config file exists
	if (
		!fileExists(dir + '/' + info.exports.config) ||
		!fileExists(dir + '/' + info.exports.replacements)
	) {
		// Rebuild is required
		if (typeof info.exports.build !== 'string') {
			throw new Error(
				`File package.json in ${packageName} is missing configurator property "exports.build"`
			);
		}

		// Check for node_modules
		if (!fileExists(dir + '/node_modules')) {
			exec(packageName, dir, 'npm', ['install']);
		}

		// Execute build command
		const list = info.exports.build.split(' ');
		exec(packageName, dir, list.shift(), list);

		// Re-check files
		if (
			!fileExists(dir + '/' + info.exports.config) ||
			!fileExists(dir + '/' + info.exports.replacements)
		) {
			throw new Error(
				`Failed locating necessary exports in ${packageName}`
			);
		}
	}

	// Return info
	return info;
}

/**
 * Load components config
 */
export function loadComponentsConfig(
	packageName: string,
	configs: LoadedConfigs
): IconFinderComponentsConfig {
	const dir = findPackage(packageName);
	const info = loadComponentInfo(packageName);

	// Import functions
	const { merge: mergeConfig, config: defaultConfig } = require(dir +
		'/' +
		info.exports.config);

	// Get default config
	let config = defaultConfig();

	// Merge all custom configurations
	configs.components.forEach((item) => {
		config = mergeObjects(config, item, mergeConfig);
	});

	return config;
}

/**
 * Load components config
 */
export function loadReplacements(
	packageName: string,
	fullConfig: IconFinderConfig,
	customFiles: CustomFiles | null
): Record<string, string> {
	const dir = findPackage(packageName);
	const info = loadComponentInfo(packageName);

	// Import functions
	const { getReplacements } = require(dir + '/' + info.exports.replacements);

	// Get replacements
	return getReplacements(fullConfig, customFiles);
}

/**
 * Get last stored config
 */
function getLastStoredConfig(
	packageName: string
): Record<string, unknown> | null {
	const dir = findPackage(packageName);
	const info = loadComponentInfo(packageName);

	try {
		return JSON.parse(readFileSync(dir + '/' + info.config.last, 'utf8'));
	} catch (err) {
		//
	}

	return null;
}

/**
 * Compare config objects
 */
export function compareLastStoredConfig(
	packageName: string,
	storedConfig: StoredIconFinderConfig
): boolean {
	const oldConfig = getLastStoredConfig(packageName);
	if (!oldConfig) {
		return false;
	}

	// Compare objects
	return compareObjects(storedConfig, oldConfig);
}

/**
 * Store config
 */
export function storeConfig(
	packageName: string,
	config: StoredIconFinderConfig,
	key: 'last' | 'current'
) {
	const dir = findPackage(packageName);
	const info = loadComponentInfo(packageName);

	writeFileSync(
		dir + '/' + info.config[key],
		JSON.stringify(config, null, '\t'),
		'utf8'
	);
}

/**
 * Rebuild components
 */
export function rebuildComponents(packageName: string) {
	const dir = findPackage(packageName);

	exec('components', dir, 'npm', ['run', 'build']);
}
