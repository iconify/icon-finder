const fs = require('fs');
const path = require('path');
const sass = require('node-sass');

// Config and constants
const requiredFiles = ['theme.json'];
const split = /[\\/]/;
const themeMatch = /^[a-z0-9_.-]+$/gi;
const rootDir = __dirname.replace(/\\/g, '/');
const allowedRootDir = rootDir;

// Get list of themes to parse
let themes = [];
let gotParams = false;
if (process.argv.length > 2) {
	process.argv.slice(2).forEach(cmd => {
		if (cmd.slice(0, 1) === '-') {
			// Some command? Not supported for now.
			return;
		}

		// Add theme from parameter
		gotParams = true;
		const result = addTheme(cmd);
		if (typeof result === 'string') {
			console.error(`Theme "${cmd}" cannot be parsed: ${result}`);
		}
	});
	if (!themes.length) {
		return;
	}
}
if (typeof process.env.UI_THEME === 'string') {
	gotParams = true;
	process.env.UI_THEME.split(',').forEach(theme => {
		const result = addTheme(theme);
		if (typeof result === 'string') {
			console.error(`Theme "${theme}" cannot be parsed: ${result}`);
		}
	});
}

if (!gotParams) {
	findAllThemes();
	if (!themes.length) {
		console.error('No valid themes found');
		return;
	}
}

// Parse themes
const built = [];
const failed = [];
const log = Object.create(null);

nextTheme();

/**
 * Find all themes
 */
function findAllThemes() {
	fs.readdirSync(rootDir).forEach(file => {
		addTheme(file);
	});
}

/**
 * Add theme to queue
 *
 * @param {string} theme
 */
function addTheme(theme) {
	if (!theme.match(themeMatch)) {
		console.error('invalid theme');
		return;
	}

	if (themes.indexOf(theme) === -1) {
		// Check directory
		try {
			const stat = fs.lstatSync(rootDir + '/' + theme);
			if (!stat.isDirectory()) {
				return 'no such directory';
			}
		} catch (err) {
			return 'no such directory';
		}

		// Check for required files
		for (let i = 0; i < requiredFiles.length; i++) {
			const file = requiredFiles[i];
			try {
				fs.lstatSync(rootDir + '/' + theme + '/' + file);
			} catch (err) {
				return 'missing ' + file;
			}
		}

		// Check for style.scss
		const style = findStyle(theme);
		if (style === null) {
			return 'missing style.scss';
		}

		// Add to queue
		themes.push(theme);
		return true;
	}
	return false;
}

/**
 * Log stuff
 */
function doneBuilding() {
	fs.writeFileSync(
		__dirname + '/build.log',
		JSON.stringify(log, null, 4),
		'utf8'
	);
	if (failed.length) {
		process.kill(process.pid, 'SIGINT');
	} else {
		process.exit(0);
	}
}

/**
 * Parse next theme
 */
function nextTheme() {
	const theme = themes.shift();
	if (theme === void 0) {
		doneBuilding();
		return;
	}

	if (built.indexOf(theme) !== -1 || failed.indexOf(theme) !== -1) {
		// Duplicate
		setTimeout(nextTheme);
		return;
	}

	if (built.length || failed.length) {
		console.log('\n------');
	}
	console.log('Bulding theme:', theme);
	buildTheme(theme)
		.then(css => {
			built.push(theme);
			console.log(`Success (${css.length} bytes)`);
			log[theme] = {
				success: true,
				length: css.length,
			};
			setTimeout(nextTheme);
		})
		.catch(err => {
			failed.push(theme);

			if (typeof err !== 'string') {
				try {
					err = err.toString();
				} catch (e) {}
			}
			if (typeof err === 'string' && allowedRootDir.length > 0) {
				while (err.indexOf(allowedRootDir + '/') !== -1) {
					err = err.replace(allowedRootDir + '/', '');
				}
			}
			console.error(err);

			log[theme] = {
				success: false,
				error: typeof err === 'string' ? err : 'Error',
			};
			setTimeout(nextTheme);
		});
}

/**
 * Build theme
 *
 * @param {string} theme
 */
function buildTheme(theme) {
	return new Promise((fulfill, reject) => {
		// Get parent themes
		let parents = [];
		try {
			checkParent(theme);
		} catch (err) {
			reject(
				typeof err === 'string'
					? `Cannot find parent theme "${err}"`
					: `Cannot find parent theme`
			);
			return;
		}

		// Get style.scss
		let content;
		const rootFile = `${rootDir}/${theme}/style.scss`;
		const actualFile = findStyle(theme);
		if (actualFile === null) {
			reject(`Cannot find style.scss for theme "${theme}"`);
			return;
		}
		try {
			content = fs.readFileSync(actualFile, 'utf8');
		} catch (err) {
			reject(`Cannot find style.scss for theme "${theme}"`);
			return;
		}

		sass.render(
			{
				file: rootFile,
				data: content,
				outputStyle: 'expanded',
				indentType: 'tab',
				indentWidth: 1,
				importer: (url, prev, done) => {
					let entry;
					try {
						entry = relativeFile(url, prev);
					} catch (err) {
						reject(err);
						return;
					}

					// Get all possible filenames
					let actualFile = null;
					let returnedFile = null;
					let contents = null;
					try {
						// Check if file is in current theme, add parent themes as possible directories
						const baseThemeDir = `${rootDir}/${theme}`;
						const dirs = [entry.dir];
						if (
							entry.dir.slice(0, baseThemeDir.length) ===
							baseThemeDir
						) {
							const extra = entry.dir.slice(baseThemeDir.length);
							if (extra === '' || extra.slice(0, 1) === '/') {
								parents.forEach(parent => {
									dirs.push(`${rootDir}/${parent}` + extra);
								});
							}
						}

						// Parse all combinations of: directories, prefixes, extensions
						dirs.forEach(dir => {
							(entry.filename.slice(0, 1) === '_'
								? ['']
								: ['_', '']
							).forEach(prefix => {
								['.scss', '.css', ''].forEach(ext => {
									actualFile =
										dir +
										'/' +
										prefix +
										entry.filename +
										ext;

									if (returnedFile === null) {
										// Use first entry as filename because it contains current theme, so it won't mess up theme hierarchy
										returnedFile = actualFile;
									}

									// console.log(`Testing: ${file}`);
									try {
										contents = fs.readFileSync(
											actualFile,
											'utf8'
										);
									} catch (e) {
										return;
									}

									// Got content. Break loops
									throw new Error(`Found file ${actualFile}`);
								});
							});
						});
					} catch (err) {}

					if (typeof contents !== 'string') {
						reject(
							`Cannot find import "${entry.filename}" in directory "${entry.dir}" (imported from "${prev}")`
						);
						return;
					}

					done({
						file: returnedFile,
						contents,
					});
				},
			},
			(error, result) => {
				if (error) {
					if (
						typeof error === 'object' &&
						typeof error.formatted === 'string'
					) {
						reject(error.formatted);
					} else {
						reject(error);
					}
				} else {
					const css = result.css.toString('utf8');
					if (!css.length) {
						reject('Theme is empty');
						return;
					}

					fs.writeFileSync(
						`${rootDir}/${theme}/style.css`,
						result.css
					);
					fulfill(css);
				}
			}
		);

		/**
		 * Find parent theme
		 * Throws failed theme name on error
		 *
		 * @param {string} theme
		 */
		function checkParent(theme) {
			// Get theme data
			let data;
			try {
				data = fs.readFileSync(
					`${rootDir}/${theme}/theme.json`,
					'utf8'
				);
				data = JSON.parse(data);
			} catch (err) {
				throw theme;
			}

			if (typeof data !== 'object') {
				throw theme;
			}

			// Check if parent theme is set
			if (typeof data.parent !== 'string' || data.parent === '') {
				return;
			}

			// Validate parent theme
			const parent = data.parent;
			if (!parent.match(themeMatch)) {
				throw parent;
			}
			if (parents.indexOf(parent) !== -1) {
				console.error(
					`Circular parent theme reference: "${theme}" - "${parent}"`
				);
				throw parent;
			}

			parents.push(parent);
			checkParent(parent);
		}
	});
}

/**
 * Get absolute filename for imported file
 *
 * @param {string} url
 * @param {string} prev
 */
function relativeFile(url, prev) {
	function fail(message) {
		throw message;
	}

	// console.log('Parsing URL:', url);
	// console.log('Relative to:', prev);

	// Get previous directory
	let dir = prev.split(split);
	dir.pop(); // Remove filename

	const urlParts = url.split(split);
	const filename = urlParts.pop();

	urlParts.forEach(part => {
		switch (part) {
			case '':
				fail(`Invalid import "${url}" in "${prev}".`);
				return;

			case '.':
				return;

			case '..':
				dir.pop();
				return;

			default:
				if (part.slice(0, 1) === '.') {
					// No hidden files!
					fail(`Invalid import "${url}" in "${prev}".`, theme);
				}
				dir.push(part);
		}
	});

	dir = dir.join('/');
	if (dir.slice(0, allowedRootDir.length) !== allowedRootDir) {
		fail(`Invalid import "${url}" in "${prev}".`, theme);
	}

	// console.log(`Returning: "${dir}" "${filename}"`);
	return {
		dir,
		filename,
	};
}

/**
 * Find style.scss, taking into consideration themes hierarchy
 *
 * @param {string} theme
 * @param {string[]} parents
 */
function findStyle(theme, parents = []) {
	// Check for style.scss in theme
	const filename = `${rootDir}/${theme}/style.scss`;
	try {
		fs.lstatSync(filename);
		return filename;
	} catch (err) {}

	// Check parent themes
	let data;
	try {
		data = fs.readFileSync(`${rootDir}/${theme}/theme.json`, 'utf8');
		data = JSON.parse(data);
	} catch (err) {
		return null;
	}

	// Validate theme.json
	if (
		typeof data !== 'object' ||
		typeof data.parent !== 'string' ||
		data.parent === '' ||
		parents.indexOf(data.parent) !== -1
	) {
		return null;
	}

	return findStyle(data.parent, parents.concat([data.parent]));
}
