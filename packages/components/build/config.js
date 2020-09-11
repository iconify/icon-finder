const fs = require('fs');
const path = require('path');

const rootDir = path.dirname(__dirname);
const packagesDir = path.dirname(rootDir);

/**
 * Check if file exists
 */
function fileExists(file) {
	try {
		fs.statSync(file);
	} catch (e) {
		return false;
	}
	return true;
}

/**
 * Load config file
 */
function loadFile(file) {
	if (!fileExists(file)) {
		return null;
	}
	try {
		let data = fs.readFileSync(file, 'utf8');
		data = JSON.parse(data);
		return data;
	} catch (err) {
		console.error(`Invalid contents in "${file}".`);
		process.exit(1);
	}
}

/**
 * Load theme config
 */
function loadTheme(theme) {
	const themeConfig = packagesDir + '/themes/dist/' + theme + '.json';
	const result = loadFile(themeConfig);
	if (result === null) {
		console.error(`Theme "${theme}" has not been compiled yet.`);
		process.exit(1);
	}
	return result;
}

/**
 * Get configuration
 */
function getConfig(verbose = true) {
	// Get config file
	let config = loadFile(rootDir + '/config.json');
	if (config === null) {
		config = loadFile(rootDir + '/lib/config.json');
		if (verbose && config !== null) {
			console.log('Using last parsed config file.');
		}
	}
	if (config === null) {
		const defaultConfig = require(packagesDir + '/configurator/lib/config');
		config = defaultConfig.config;
		if (verbose) {
			console.log('Using default config.');
		}
	}

	// Get theme
	if (typeof config.theme !== 'string' || config.theme === '') {
		config.theme = 'iconify';
		if (verbose) {
			console.log('Using default theme: Iconify');
		}
	}
	config.themeData = loadTheme(config.theme);

	return config;
}

/**
 * Get replacements
 */
function getReplacements(config) {
	const { generateReplacements } = require(packagesDir +
		'/configurator/lib/replacements');
	return generateReplacements(config);
}

module.exports = {
	getConfig,
	getReplacements,
};
