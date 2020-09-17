import { readFileSync } from 'fs';
import { IconFinderConfig } from '../config/full';
import { ConfiguratorParams } from '../params/type';
import { IconFinderCommonConfig } from '../config/common';
import { RecursivePartial } from '../config/partial';
import { locatePackageFile } from '../find-package';

// Type for one entry
type LoadedConfig = Record<string, unknown>;

// Type to convert IconFinderConfig to simple objects
type Convert<T> = Record<keyof T, LoadedConfig[]>;

// Type for result
export type LoadedConfigs = Convert<IconFinderConfig>;

/**
 * Load configurations as basic objects:
 * - Loads config from files
 * - Adds custom config
 * - Sets theme name
 */
export function loadConfigFromParams(
	params: ConfiguratorParams
): LoadedConfigs {
	const result: LoadedConfigs = {
		common: [],
		components: [],
		theme: [],
	};

	// Load all config files
	const filesData: LoadedConfig[] = [];
	params.configFiles.forEach((file) => {
		if (params.verbose) {
			console.log(`Loading custom configuration from file ${file}`);
		}

		// Attemt to load file
		const filename = locatePackageFile(file);
		if (typeof filename === 'string') {
			try {
				const data = JSON.parse(readFileSync(filename, 'utf8'));
				if (typeof data === 'object') {
					filesData.push(data);
				} else if (params.verbose) {
					console.log(
						`Failed to load custom configuration: invalid data!`
					);
				}
				return;
			} catch (err) {
				if (params.debug) {
					console.error(err);
				}
			}
		}

		// Failed
		throw new Error(`Cannot find config file ${file}`);
	});

	// Parse all keys
	Object.keys(result).forEach((key) => {
		const attr = key as keyof LoadedConfigs;

		// Load data from files
		filesData.forEach((item) => {
			if (typeof item[key] === 'object') {
				result[attr].push(item[key] as Record<string, unknown>);
			}
		});

		// Append custom data
		result[attr] = result[attr].concat(params.config[attr]);
	});

	// Add custom theme
	if (typeof params.theme === 'string' && params.theme !== '') {
		if (params.verbose) {
			console.log(`Using custom theme: ${params.theme}`);
		}
		const themeData: RecursivePartial<IconFinderCommonConfig> = {
			theme: {
				name: params.theme,
			},
		};
		result.common.push(themeData);
	}

	if (params.debug) {
		console.log('Loaded custom configuration:');
		console.log(JSON.stringify(result, null, 2));
	}

	return result;
}
