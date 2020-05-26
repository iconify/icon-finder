import { statSync } from 'fs';
import { dirname } from 'path';

/**
 * Path to packages directory
 */
export const packagesPath = dirname(dirname(__dirname));

/**
 * Test files to check if core has been compiled
 */
export function coreTestFiles(): string[] {
	return [packagesPath + '/core/lib/index.js'];
}

/**
 * Test files to check if theme exists
 */
export function themeSourceTestFiles(theme: string): string[] {
	return [packagesPath + '/themes/' + theme + '/theme.json'];
}

/**
 * Files to test if theme has been compiled
 */
export function themeCompiledTestFiles(theme: string): string[] {
	return [theme + '.json', theme + '.css'].map(
		(file) => packagesPath + '/themes/dist/' + file
	);
}

/**
 * File to store config
 */
export function componentsSourceConfigFile(): string {
	return packagesPath + '/components/config.json';
}

export function componentsCompiledConfigFile(): string {
	return packagesPath + '/components/lib/config.json';
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
