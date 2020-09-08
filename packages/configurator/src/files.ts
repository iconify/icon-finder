import { statSync, readdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { IconFinderConfig } from './config';

/**
 * Test files to check if core has been compiled
 */
export function coreTestFiles(config: IconFinderConfig): string[] {
	return [packageDir('@iconify/search-core') + '/lib/index.js'];
}

/**
 * Test files to check if theme exists
 */
export function themeSourceTestFiles(
	config: IconFinderConfig,
	theme: string
): string[] {
	return [packageDir(config.packages.themes) + '/' + theme + '/theme.json'];
}

/**
 * Files to test if theme has been compiled
 */
export function themeCompiledTestFiles(
	config: IconFinderConfig,
	theme: string
): string[] {
	return [theme + '.json', theme + '.css'].map(
		(file) => packageDir(config.packages.themes) + '/dist/' + file
	);
}

/**
 * File to store config
 */
export function componentsSourceConfigFile(config: IconFinderConfig): string {
	return packageDir(config.packages.components) + '/config.json';
}

export function componentsCompiledConfigFile(config: IconFinderConfig): string {
	return packageDir(config.packages.components) + '/lib/config.json';
}

/**
 * Check if file exists
 */
export function fileExists(file: string): boolean {
	try {
		statSync(file);
	} catch (e) {
		return false;
	}
	return true;
}

/**
 * Check if all files exist
 */
export function filesExist(files: string[]): boolean {
	for (let i = 0; i < files.length; i++) {
		if (!fileExists(files[i])) {
			return false;
		}
	}
	return true;
}

/**
 * Get directory of a package
 */
export function packageDir(pack: string): string {
	try {
		return dirname(require.resolve(pack + '/package.json'));
	} catch (err) {
		// Something went wrong, try locating package in monorepo
		const packs = getLocalPackages();
		if (packs[pack] !== void 0) {
			return packs[pack];
		}
		throw new Error(
			`Failed to locate package ${pack}. Make sure dependencies are installed.`
		);
	}
}

let cachedLocalPackages: Record<string, string> | null = null;

/**
 * Get list of packages in monorepo (only checks 'packages' directory)
 */
function getLocalPackages(): Record<string, string> {
	if (cachedLocalPackages !== null) {
		return cachedLocalPackages;
	}
	cachedLocalPackages = Object.create(null);

	// Check packages directory
	[
		dirname(dirname(__dirname)),
		// dirname(process.cwd())
	].forEach((dir) => {
		readdirSync(dir).forEach((name) => {
			const packDir = dir + '/' + name;
			const packFile = packDir + '/package.json';
			if (fileExists(packFile)) {
				try {
					const data = JSON.parse(readFileSync(packFile, 'utf8'));
					if (typeof data.name === 'string') {
						cachedLocalPackages[data.name] = packDir;
					}
				} catch (err) {
					//
				}
			}
		});
	});

	return cachedLocalPackages;
}
