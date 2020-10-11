import fs from 'fs';
import path from 'path';

const rootDir = path.dirname(__dirname);

/**
 * Create directory recursively, starting with rootDir
 */
export function mkdir(dir: string): void {
	if (dir.slice(0, rootDir.length) !== rootDir) {
		return;
	}
	let current = rootDir;
	let extra = dir.slice(rootDir.length).split('/');

	while (extra.length) {
		try {
			fs.mkdirSync(dir, 0o755);
		} catch (err) {}
		const next = extra.shift();
		if (next !== '') {
			current += '/' + next;
		}
	}
}

/**
 * Remove file
 */
export function unlink(file: string): void {
	try {
		fs.unlinkSync(file);
	} catch (err) {}
}

/**
 * List all files in directory
 */
export function listFiles(dir: string | string[]): string[] {
	let results: string[] = [];

	function rec(extra: string) {
		let files: string[];
		let base: string;

		try {
			files = fs.readdirSync(dir + extra);
		} catch (err) {
			return;
		}

		base = extra.length ? extra.slice(1) + '/' : '';

		files.forEach((file) => {
			let filename = dir + extra + '/' + file,
				stats;

			try {
				stats = fs.lstatSync(filename);
			} catch (err) {
				return;
			}

			if (stats.isDirectory()) {
				if (file === '.git') {
					return;
				}
				rec(extra + '/' + file);
				return;
			}

			if (stats.isFile()) {
				results.push(base + file);
			}
		});
	}

	if (typeof dir === 'object') {
		// Scan multiple directories
		dir.forEach((dir: string) => {
			results = results.concat(listFiles(dir));
		});

		// Unique files
		results.sort();
		let lastFile = '';
		results = results.filter((file) => {
			if (file === lastFile) {
				return false;
			}
			lastFile = file;
			return true;
		});
	} else {
		rec('');
	}

	return results;
}

/**
 * Save file
 */
export function writeFile(filename: string, data: string) {
	const parts = filename.split('/');
	const name = parts.pop()!;
	const dir = filename.slice(0, filename.length - name.length - 1);
	mkdir(dir);
	fs.writeFileSync(filename, data, 'utf8');
}

/**
 * Find file in one of multiple possible locations
 */
export function locateFile(dirs: string[], filename: string): string {
	for (let i = 0; i < dirs.length; i++) {
		try {
			fs.lstatSync(dirs[i] + filename);
			return dirs[i];
		} catch (err) {}
	}
	throw new Error(`Cannot locate file ${filename}`);
}
