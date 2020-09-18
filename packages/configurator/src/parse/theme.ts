import { readFileSync } from 'fs';
import { IconFinderCommonThemeConfig } from '../config/common';
import { LoadedConfigs } from './configs';
import {
	IconFinderThemeConfig,
	config as defaultConfig,
	merge as mergeConfig,
	ThemePackageInfo,
} from '../config/theme';
import { findPackage } from '../find-package';
import { merge } from '../config/merge';
import { exec } from './rebuild';
import { ConfiguratorParams } from '../params/type';
import { fileExists } from '../file-exists';

// Blank into data to test fields
const defaultPackageInfo: ThemePackageInfo = {
	stylesheet: '',
	config: '',
};

const infoCache: Record<string, ThemePackageInfo> = Object.create(null);

/**
 * Get info from package.json
 */
export function getThemePackageInfo(
	theme: IconFinderCommonThemeConfig
): ThemePackageInfo {
	const cacheKey = JSON.stringify(theme);
	if (infoCache[cacheKey] !== void 0) {
		return infoCache[cacheKey];
	}

	// Locate package
	const dir = findPackage(theme.package);

	// Read package.json
	let packageData: Record<string, unknown>;
	try {
		packageData = JSON.parse(readFileSync(dir + '/package.json', 'utf8'));
	} catch (err) {
		//
	}
	if (typeof packageData !== 'object') {
		throw new Error(`Could not locate package.json for ${theme.package}`);
	}
	if (typeof packageData.configurator !== 'object') {
		throw new Error(
			`File package.json in ${theme.package} does not contain configurator metadata`
		);
	}

	// Get info and validate it
	let info = packageData.configurator as ThemePackageInfo;
	Object.keys(defaultPackageInfo).forEach((key) => {
		if (typeof info[key] !== typeof defaultPackageInfo[key]) {
			throw new Error(
				`File package.json in ${theme.package} is missing configurator property "${key}"`
			);
		}
	});

	// Support for theme name
	if (info.multipleThemes) {
		if (typeof theme.name !== 'string' || theme.name === '') {
			throw new Error(`Theme name is not set`);
		}

		Object.keys(info).forEach((key) => {
			if (typeof info[key] === 'string') {
				info[key] = info[key].replace(/{theme}/g, theme.name);
			}
		});
	}

	// Cache and return data
	infoCache[cacheKey] = info;
	return info;
}

/**
 * Locate theme config file
 */
export function locateThemeFile(
	theme: IconFinderCommonThemeConfig,
	file: 'stylesheet' | 'config'
): string {
	const dir = findPackage(theme.package);
	const info = getThemePackageInfo(theme);

	// Return filename
	return dir + '/' + info[file];
}

/**
 * Rebuild theme
 */
export function rebuildTheme(theme: IconFinderCommonThemeConfig) {
	const info = getThemePackageInfo(theme);
	if (typeof info.build !== 'string') {
		throw new Error(
			`Theme requires rebuild, but there is no build command in configurator section of theme package.json`
		);
	}

	const parts = info.build.split(' ');
	exec('theme', findPackage(theme.package), parts.shift(), parts);
}

/**
 * Get theme config and rebuild theme if needed
 */
export function loadThemeConfig(
	theme: IconFinderCommonThemeConfig,
	configs: LoadedConfigs,
	params: ConfiguratorParams
): IconFinderThemeConfig {
	// Load theme files
	const themeConfigFile = locateThemeFile(theme, 'config');
	const themeStylesheetFile = locateThemeFile(theme, 'stylesheet');
	if (!fileExists(themeConfigFile) || !fileExists(themeStylesheetFile)) {
		if (params.verbose) {
			console.log('Missing theme files. Going to rebuild theme');
		}
		params.rebuild.theme = true;
	}

	// Rebuild theme
	if (params.rebuild.theme) {
		if (params.verbose) {
			console.log('Rebuilding theme');
		}
		rebuildTheme(theme);
		// Mark components for rebuild
		params.rebuild.components = true;
	}

	// Check config file
	let themeConfig: Record<string, unknown>;
	try {
		themeConfig = JSON.parse(readFileSync(themeConfigFile, 'utf8'));
	} catch (err) {
		if (params.debug) {
			console.error(err);
		}
		throw new Error(`Error reading theme config file ${themeConfigFile}`);
	}

	// Default config
	let config = defaultConfig();

	// Merge theme config
	config = merge(config, themeConfig, mergeConfig);

	// Merge all custom configurations
	configs.theme.forEach((item) => {
		config = merge(config, item, mergeConfig);
	});

	return config;
}
