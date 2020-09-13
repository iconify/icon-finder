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
		// Attemt to load file
		const filename = locatePackageFile(file);
		if (typeof filename === 'string') {
			try {
				const data = JSON.parse(readFileSync(filename, 'utf8'));
				if (typeof data === 'object') {
					filesData.push(data);
				}
				return;
			} catch (err) {
				//
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
		const themeData: RecursivePartial<IconFinderCommonConfig> = {
			theme: {
				name: params.theme,
			},
		};
		result.common.push(themeData);
	}

	return result;
}
