const fs = require('fs');
const sass = require('node-sass');

// Config and constants
const rootDir = __dirname.replace(/\\/g, '/');

const requiredFiles = ['theme.json'];
const split = /[\\/]/;

const themeMatch = /^[a-z0-9][a-z0-9_.-]*[a-z0-9]$/gi;
const outDir = 'dist';
const reservedDirs = [outDir, 'node_modules'];

// Options
let verbose = false;
let themes = Object.create(null);

// Add themes
const addThemes = (value, err) => {
	const parts = value.split(',');
	parts.forEach((theme) => {
		if (!theme.match(themeMatch)) {
			if (err === false) {
				// Ignore error
				return;
			}
			console.error(err);
			process.exit(1);
		}

		if (reservedDirs.indexOf(theme.toLowerCase()) !== -1) {
			if (err === false) {
				// Ignore error
				return;
			}
			console.error(err);
			process.exit(1);
		}

		themes[theme] = true;
	});
};

// Parse parameters
if (process.argv.length > 2) {
	let nextTheme = true; // Assume first argument is list of themes
	process.argv.slice(2).forEach((param) => {
		if (param.slice(0, 2) === '--') {
			nextTheme = false;
			switch (param) {
				case '--verbose':
					verbose = true;
					return;

				case '--all':
					fs.readdirSync(__dirname).forEach((file) => {
						try {
							fs.lstatSync(
								__dirname + '/' + file + '/theme.json'
							);
							fs.lstatSync(
								__dirname + '/' + file + '/theme.scss'
							);
							addThemes(file, false);
						} catch (err) {}
					});

				case '--theme':
					// next argument is theme
					nextTheme = true;
					return;

				default:
					const parts = param.split('=');
					if (parts.length === 2 && parts.shift() === '--theme') {
						// `--theme=name`
						addThemes(parts.pop(), `Invalid parameter "${param}".`);
						return;
					}
					console.error(`Invalid parameter "${param}".`);
					process.exit(1);
			}
		}

		if (!nextTheme) {
			console.error(`Invalid parameter "${param}".`);
			process.exit(1);
		}
		nextTheme = false;

		addThemes(param, `Invalid parameter "${param}".`);
	});
}

// Try UI_THEME env variable
if (typeof process.env.UI_THEME === 'string') {
	const param = process.env.UI_THEME;
	addThemes(param, `Invalid UI_THEME environment variable "${param}".`);
}

// Check all themes
themes = Object.keys(themes);
if (!themes.length) {
	console.error(
		'Missing theme name parameter. Use `node build --theme theme-name`'
	);
	process.exit(1);
}

/**
 * Parse next theme
 */
function nextTheme() {
	const theme = themes.shift();
	if (theme === void 0) {
		return;
	}
	requiredFiles.forEach((file) => {
		const filename = theme + '/' + file;
		if (!fileExists(rootDir + '/' + filename)) {
			console.error(`Missing required file: ${filename}`);
			process.exit(1);
		}
	});

	if (verbose) {
		console.log('Parsing theme:', theme);
	}

	// Get theme config and parent themes
	const themesTree = [];
	const config = getConfig(theme);

	// Root directory for current theme
	const themeRootDir = rootDir + '/' + theme;

	// Build theme
	buildTheme()
		.then((css) => {
			const dir = rootDir + '/' + outDir;
			try {
				fs.mkdirSync(dir, 0o755);
			} catch (err) {}

			// Write stylesheet
			fs.writeFileSync(`${dir}/${theme}.css`, css);
			console.log(`Saved ${outDir}/${theme}.css (${css.length} bytes)`);

			// Write config
			delete config.parent;
			config.theme = theme;
			config.parent = themesTree.slice(1);

			const content = JSON.stringify(config, null, 4);
			fs.writeFileSync(`${dir}/${theme}.json`, content);
			console.log(
				`Saved ${outDir}/${theme}.json (${content.length} bytes)`
			);
			setTimeout(nextTheme);
		})
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});

	/**
	 * Check if file exists
	 */
	function fileExists(filename) {
		try {
			fs.lstatSync(filename);
			return true;
		} catch (err) {
			return false;
		}
	}

	/**
	 * Get rotation count
	 */
	function getRotation(dir) {
		if (!fileExists(dir + '/rotation.json')) {
			return null;
		}
		const raw = fs.readFileSync(dir + '/rotation.json');
		// Use "eval" to allow comments in file
		let data;
		eval('data = ' + raw);
		if (typeof data !== 'object' && !data instanceof Array) {
			throw new Error('Invalid rotation.json content');
		}
		return data.length;
	}

	/**
	 * Get theme configuration
	 */
	function getConfig(theme) {
		const filename = theme + '/theme.json';
		if (!fileExists(rootDir + '/' + filename)) {
			console.error(`Missing required file: ${filename}`);
			process.exit(1);
		}

		// Get config
		const config = JSON.parse(
			fs.readFileSync(rootDir + '/' + filename, 'utf8')
		);
		if (typeof config !== 'object') {
			console.error(`Invalid config file: ${filename}`);
			process.exit(1);
		}

		// Get rotation
		const rotation = getRotation(rootDir + '/' + theme);
		if (rotation !== null) {
			config.rotation = rotation;
		}

		// Add theme to tree
		themesTree.push(theme);

		// Check parent theme
		if (config.parent !== void 0) {
			const parent = config.parent;

			// Check for valid name
			if (
				typeof parent !== 'string' ||
				!parent.match(themeMatch) ||
				reservedDirs.indexOf(parent.toLowerCase()) !== -1
			) {
				console.error(
					`Invalid parent theme in config file: ${filename}`
				);
				process.exit(1);
			}

			// Check for loop
			if (parent === theme || themesTree.indexOf(parent) !== -1) {
				console.error(
					`Invalid parent theme in config file: ${filename}`
				);
				process.exit(1);
			}

			// Get parent config and merge it
			const parentConfig = getConfig(parent);
			Object.keys(parentConfig).forEach((key) => {
				if (config[key] === void 0) {
					config[key] = parentConfig[key];
					return;
				}

				// Merge / ignore
				switch (key) {
					case 'rotation':
						// Ignore rotation if it is already set
						return;

					case 'icons':
						// Merge objects
						if (
							typeof config[key] !== 'object' ||
							typeof parentConfig[key] !== 'object'
						) {
							return;
						}
						Object.keys(parentConfig[key]).forEach((key2) => {
							if (config[key][key2] === void 0) {
								config[key][key2] = parentConfig[key][key2];
							}
						});
						return;

					default:
					// Do nothing - config overwrites parentConfig value
				}
			});
		}

		return config;
	}

	/**
	 * Build theme
	 */
	function buildTheme() {
		return new Promise((fulfill, reject) => {
			// Get theme.scss
			let content;
			const actualFile = locateFile('theme.scss');
			if (actualFile === null) {
				reject(`Cannot find theme.scss for theme "${theme}"`);
				return;
			}
			try {
				content = fs.readFileSync(actualFile, 'utf8');
			} catch (err) {
				reject(`Cannot find style.scss for theme "${theme}"`);
				return;
			}

			if (verbose) {
				console.log('Importing:', actualFile.slice(rootDir.length + 1));
			}

			sass.render(
				{
					file: themeRootDir + '/theme.scss',
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
						const filenames = [];
						const parts = entry.filename.split('.');
						const ext = parts.length > 1 ? parts.pop() : '';

						(entry.filename.slice(0, 1) === '_'
							? ['']
							: ['_', '']
						).forEach((prefix) => {
							let extensions;
							switch (ext) {
								case 'css':
								case 'scss':
								case 'json':
									extensions = [''];
									break;

								default:
									extensions = ['.json', '.scss', '.css'];
							}

							extensions.forEach((ext) => {
								filenames.push(prefix + entry.filename + ext);
							});
						});

						// Debug
						// console.log(entry);
						// console.log(filenames);

						// Locate file
						const locatedFile = locateFile(filenames, entry.dir);
						if (locateFile === null) {
							reject(
								`Cannot find import "${entry.filename}" in directory "${entry.dir}" (imported from "${prev}")`
							);
							return;
						}

						// Get contents
						let contents;
						try {
							contents = getStylesheet(locatedFile);
						} catch (err) {
							reject(
								`Cannot read import "${entry.filename}" in directory "${entry.dir}" (imported from "${prev}")`
							);
							return;
						}
						if (verbose) {
							console.log(
								'Importing:',
								locatedFile.slice(rootDir.length + 1)
							);
						}

						done({
							file:
								themeRootDir + '/' + entry.dir + entry.filename,
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
						fulfill(css);
					}
				}
			);
		});
	}

	/**
	 * Get stylesheet
	 */
	function getStylesheet(filename) {
		const ext = filename.split('.').pop();
		const raw = fs.readFileSync(filename, 'utf8');

		if (ext !== 'json') {
			return raw;
		}

		// Get filename without extension, use it as variable name
		let prefix = filename.split(split).pop().split('.').shift();
		if (prefix.slice(0, 1) === '_') {
			prefix = prefix.slice(1);
		}

		// Use "eval" to allow comments in file
		let data;
		eval('data = ' + raw);
		const vars = [];

		function parse(prefix, data) {
			switch (typeof data) {
				case 'object':
					break;

				case 'boolean':
					vars.push(
						'$' +
							prefix +
							': ' +
							(data ? 'true !default;' : 'false !default;')
					);
					return;

				default:
					vars.push('$' + prefix + ': ' + data + ' !default;');
					return;
			}

			// Object
			if (data instanceof Array) {
				// Only simple arrays allowed: strings and numbers
				vars.push(
					'$' + prefix + ': (' + data.join(', ') + ') !default;'
				);
				return;
			}

			Object.keys(data).forEach((key) => {
				parse(prefix + '-' + key, data[key]);
			});
		}

		parse(prefix, data);

		return vars.join('\n');
	}

	/**
	 * Locate file(s) using themes tree
	 */
	function locateFile(file, dir = '') {
		const files = typeof file === 'string' ? [file] : file;
		for (let i = 0; i < themesTree.length; i++) {
			for (let j = 0; j < files.length; j++) {
				const filename = `${rootDir}/${themesTree[i]}/${dir}${files[j]}`;
				if (fileExists(filename)) {
					return filename;
				}
			}
		}

		return null;
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

		// Get parent directories
		const dirs = prev.split(split);
		dirs.pop(); // Remove filename

		const urlParts = url.split(split);
		const filename = urlParts.pop();

		urlParts.forEach((part) => {
			switch (part) {
				case '':
					fail(`Invalid import "${url}" in "${prev}".`);
					return;

				case '.':
					return;

				case '..':
					dirs.pop();
					return;

				default:
					if (part.slice(0, 1) === '.') {
						// No hidden files!
						fail(`Invalid import "${url}" in "${prev}".`, theme);
					}
					dirs.push(part);
			}
		});

		fullDir = dirs.join('/');
		// console.log('Full directory:', fullDir);

		// Get part after theme directory
		if (fullDir.slice(0, themeRootDir.length) !== themeRootDir) {
			fail(`Invalid import "${url}" in "${prev}".`, theme);
		}
		const dir = fullDir.slice(themeRootDir.length);

		// console.log(`Returning: "${dir}" "${filename}"`);
		const level = dir.split(split).length - 1;

		return {
			// Move '/' from start to end
			dir: level ? dir.slice(1) + '/' : '',
			level,
			filename,
		};
	}
}

nextTheme();
