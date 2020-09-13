import { lstatSync, readdirSync, Stats } from 'fs';
import { locatePackageFile } from '../find-package';

/**
 * Custom file data
 */
export interface CustomFile {
	filename: string;
	size: number;
	mtime: number;
}

export interface CustomFiles {
	path: string;
	files: CustomFile[];
}

/**
 * Locate directory
 */
function getDirectory(path: string): string {
	const filename = locatePackageFile(path);

	// Check for directory
	if (typeof filename === 'string') {
		try {
			const stat = lstatSync(filename);
			if (stat.isDirectory()) {
				return filename;
			}
		} catch (err) {
			//
		}
	}

	throw new Error(`Error loading custom files from ${path}`);
}

/**
 * Callback for sorting files
 */
function sortFiles(a: CustomFile, b: CustomFile): number {
	return a.filename.localeCompare(b.filename);
}

/**
 * Find all custom files
 */
export function getCustomFiles(path: string): CustomFiles {
	const results = {
		path: getDirectory(path),
		files: [],
	};

	// Find all files in directory
	function scan(dir: string, prefix: string) {
		// Get all files in directory
		let files: string[];
		try {
			files = readdirSync(dir);
		} catch (err) {
			return;
		}

		files.forEach((file) => {
			// Do not allow hidden files and directories
			if (file.slice(0, 1) === '.') {
				return;
			}

			// Full filename and stats
			let filename = dir + '/' + file;
			let stats: Stats;

			try {
				stats = lstatSync(filename);
			} catch (err) {
				return;
			}

			if (stats.isDirectory()) {
				scan(dir + '/' + file, prefix + '/' + file);
				return;
			}

			if (stats.isFile()) {
				const item: CustomFile = {
					filename: prefix + '/' + file,
					size: stats.size,
					mtime: stats.mtime.getTime(),
				};
				results.files.push(item);
			}
		});
	}
	scan(results.path, '');

	// Sort and return results
	results.files.sort(sortFiles);
	return results;
}
