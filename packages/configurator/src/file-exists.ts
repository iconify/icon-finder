import { statSync } from 'fs';

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
