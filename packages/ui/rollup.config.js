import path from 'path';
import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@cyberalien/rollup-plugin-typescript2';
import { Replacements } from '@cyberalien/conditional-replacements';

const requiredIcons = ['reset', 'search', 'parent', 'grid', 'list'];

const themeMatch = /^[a-z0-9_.-]+$/gi;

const production = !process.env.ROLLUP_WATCH;

/**
 * Load UI configuration
 */
const packagesDir = path.dirname(__dirname) + '/';
const config = {
	themePath: 'default',
	theme: {},
};
let included = {};

// Default configuration
parseConfig(config, 'default');

// Get default development config from dev.config.json
// dev.config.json is not added to repository, so it is safe to edit.
// Copy dev.config.json-sample to dev.config.json and run `npm run dev`
let devConfig = null;
if (!production) {
	try {
		devConfig = JSON.parse(
			fs.readFileSync(__dirname + '/dev.config.json', 'utf8')
		);
		if (devConfig.theme.match(themeMatch)) {
			config.themePath = devConfig.theme;
		}
	} catch (err) {
		devConfig = null;
	}
}

// Parse configuration files
// Example: UI_CONFIG=local npm run build
if (typeof process.env.UI_CONFIG === 'string') {
	setConfig(process.env.UI_CONFIG);
} else if (
	devConfig &&
	typeof devConfig === 'object' &&
	typeof devConfig.config === 'string'
) {
	setConfig(devConfig.config);
}

// Add custom theme
// Example: UI_THEME=figma npm run build
if (typeof process.env.UI_THEME === 'string') {
	const theme = process.env.UI_THEME;
	if (theme.match(themeMatch)) {
		config.themePath = theme;
	}
}
parseThemeConfig(config, config.themePath);

/**
 * Validate config
 */
if (typeof config.theme.rotation !== 'number' || !config.theme.rotation) {
	throw new Error('Theme error: "rotation" should be a number.');
}

/**
 * Generate replacements
 */
const replacementPairs = {
	// Colors rotation
	'maxIndex = 10': 'maxIndex = ' + Math.max(1, config.theme.rotation),
};

// Support custom views
if (!config['custom-view']) {
	replacementPairs['supportCustomView = true'] = 'supportCustomView = false';
	replacementPairs['./views/Custom.svelte'] = './Empty.svelte';
}

// Focus search
if (!config.theme['focus-search']) {
	replacementPairs['canFocusSearch = true'] = 'canFocusSearch = false';
}

// Collections list
if (!config.theme['collections-list-author-link']) {
	replacementPairs['authorLink = true'] = 'authorLink = false';
}
if (config.theme['collections-list-clickable']) {
	replacementPairs['collectionClickable = false'] =
		'collectionClickable = true';
}

// Language
if (typeof config.language === 'string') {
	replacementPairs['/phrases/en'] = '/phrases/' + config.language;
}

// Options
if (typeof config.options === 'object') {
	replacementPairs['options = {}'] =
		'options = ' + JSON.stringify(config.options);
}
if (typeof config.iconify === 'object') {
	replacementPairs['iconifyOptions = {}'] =
		'iconifyOptions = ' + JSON.stringify(config.iconify);
}

// Icons
if (typeof config.theme.icons !== 'object') {
	throw new Error('Theme error: missing "icons" object.');
}
requiredIcons.forEach(icon => {
	if (config.theme.icons[icon] === void 0) {
		throw new Error(`Theme error: missing icon "${icon}`);
	}
});
replacementPairs['uiIcons = {}'] =
	'uiIcons = ' + JSON.stringify(config.theme.icons);

// Instance
const replacements = new Replacements(replacementPairs, '@iconify-replacement');

/**
 * Export
 */
export default {
	input: 'src/ui/ui.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'ui',
		file: 'dist/ui.js',
		globals: {
			'@iconify/iconify': 'Iconify',
		},
	},
	external: ['@iconify/iconify'],
	plugins: [
		resolve({
			browser: true,
			extensions: ['.ts', '.js', '.svelte'],
			dedupe: importee =>
				importee === 'svelte' || importee.startsWith('svelte/'),
		}),
		svelte({
			preprocess: {
				script: input => {
					return {
						code: replacements.parse(input.content),
					};
				},
			},
		}),
		commonjs(),
		typescript({
			preprocess: code => {
				const result = replacements.parse(code);
				// console.log(result);
				return result;
			},
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
};

/**
 * Merge objects
 *
 * @param {*} target
 * @param {*} source
 */
function merge(target, source) {
	Object.keys(source).forEach(key => {
		if (target[key] === void 0) {
			target[key] = source[key];
			return;
		}

		switch (typeof source[key]) {
			case 'object':
				if (typeof target[key] !== 'object') {
					// Object overrides non-object
					target[key] = source[key];
					return;
				}
				// Merge objects
				merge(target[key], source[key]);
				return;

			default:
				// Overwrite
				target[key] = source[key];
		}
	});
}

/**
 * Parse configuration file
 *
 * @param {*} config
 * @param {string} file
 */
function parseConfig(config, file) {
	// Read file
	const filename = `config/${file}.json`;
	let data;
	try {
		const content = fs.readFileSync(packagesDir + filename, 'utf8');
		data = JSON.parse(content);
	} catch (err) {
		throw new Error(
			`Error reading configuration from packages/${filename}`
		);
	}

	// Check data
	if (!data || typeof data !== 'object') {
		throw new Error(`Invalid configuration file: packages/${filename}`);
	}

	// Merge
	merge(config, data);
}

/**
 * Set config
 *
 * @param {string} str
 */
function setConfig(str) {
	str.split(',')
		.map(item => item.trim())
		.filter(item => item.match(/^[a-z0-9_.-]+$/g))
		.forEach(file => {
			parseConfig(config, file);
		});
}

/**
 * Parse theme configuration
 *
 * @param {*} config
 * @param {string} theme
 */
function parseThemeConfig(config, theme) {
	const filename = `themes/${theme}/theme.json`;
	let data;
	try {
		const content = fs.readFileSync(packagesDir + filename, 'utf8');
		data = JSON.parse(content);
	} catch (err) {
		throw new Error(
			`Error reading configuration from packages/${filename}`
		);
	}

	// Check data
	if (!data || typeof data !== 'object') {
		throw new Error(`Invalid configuration file: packages/${filename}`);
	}

	// Mark as included
	if (included.themes === void 0) {
		included.themes = [];
	}
	included.themes.push(theme);

	// Check for parent theme
	if (typeof data.parent === 'string' && data.parent !== '') {
		const parent = data.parent;
		delete data.parent;
		if (!parent.match(themeMatch)) {
			throw new Error(`Invalid parent theme in: packages/${filename}`);
		}
		if (included.themes.indexOf(parent) !== -1) {
			throw new Error(`Circular parent theme in: packages/${filename}`);
		}
		parseThemeConfig(config, parent);
	}

	// Merge
	merge(config.theme, data);
}
