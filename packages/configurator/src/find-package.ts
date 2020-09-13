import { statSync, readdirSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { fileExists } from './file-exists';

// Cache
const packagesCache: Record<string, string> = Object.create(null);

/**
 * Locate package
 */
export function findPackage(name: string): string {
	if (packagesCache[name] !== void 0) {
		return packagesCache[name];
	}

	// Try to resolve
	try {
		const packageLocation = require.resolve(name + '/package.json');
		const dir = dirname(packageLocation);
		packagesCache[name] = dir;
		return packagesCache[name];
	} catch (err) {
		// Failed to resolve
	}

	// Look in local packages
	const localPackages = getLocalPackages();
	if (localPackages[name] !== void 0) {
		packagesCache[name] = localPackages[name];
		return packagesCache[name];
	}

	throw new Error(`Cannot locate package ${name}`);
}

// Cache
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
			try {
				const data = JSON.parse(readFileSync(packFile, 'utf8'));
				if (typeof data.name === 'string') {
					cachedLocalPackages[data.name] = packDir;
				}
			} catch (err) {
				//
			}
		});
	});

	return cachedLocalPackages;
}

/**
 * Locate package file
 */
export function locatePackageFile(file: string): string | null {
	if (fileExists(file)) {
		return file;
	}

	const parts = file.split('/');
	const localPackages = getLocalPackages();
	let testPackage = parts.shift();
	for (let i = 0; i < 2; i++) {
		// Local package
		if (localPackages[testPackage] !== void 0) {
			const dir = localPackages[testPackage];
			return dir + (parts.length ? '/' + parts.join('/') : '');
		}

		// Attempt to resolve
		try {
			const packageJSON = require.resolve(testPackage + '/package.json');
			const pathParts = packageJSON.split('/');
			pathParts.pop();
			const dir = pathParts.join('/');
			return dir + (parts.length ? '/' + parts.join('/') : '');
		} catch (err) {}

		// Add second part to testPackage
		if (!parts.length) {
			return null;
		}
		testPackage += '/' + parts.shift();
	}

	return null;
}
