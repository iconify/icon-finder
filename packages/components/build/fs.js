const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(__dirname);

/**
 * Create directory recursively, starting with rootDir
 */
function mkdir(dir) {
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
function unlink(file) {
	try {
		fs.unlinkSync(file);
	} catch (err) {}
}

/**
 * List all files in directory
 */
function listFiles(dir) {
	let results = [];

	function rec(extra) {
		let files, base;

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
		dir.forEach((dir) => {
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
function writeFile(filename, data) {
	const parts = filename.split('/');
	const name = parts.pop();
	const dir = filename.slice(0, filename.length - name.length - 1);
	mkdir(dir);
	fs.writeFileSync(filename, data, 'utf8');
}

/**
 * Read file from multiple possible locations
 */
function readFile(dirs, filename) {
	for (let i = 0; i < dirs.length; i++) {
		try {
			const content = fs.readFileSync(dirs[i] + filename, 'utf8');
			return content;
		} catch (err) {}
	}
	throw new Error(`Cannot locate file ${filename}`);
}

/**
 * Export
 */
module.exports = {
	mkdir,
	unlink,
	listFiles,
	writeFile,
	readFile,
};
