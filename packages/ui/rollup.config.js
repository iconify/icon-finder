import path from 'path';
import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from '@cyberalien/rollup-plugin-typescript2';
import { Replacements } from '@cyberalien/conditional-replacements';
import colors from 'cyberalien-color';
import { defaultProperties } from './src/misc/default-properties';

const requiredIcons = ['reset', 'search', 'parent', 'grid', 'list'];
const overwriteChildenConfig = ['footer', 'icons'];

const themeMatch = /^[a-z0-9_.-]+$/gi;

const production = !process.env.ROLLUP_WATCH;

/**
 * Load UI configuration
 */
const packagesDir = path.dirname(__dirname) + '/';
const config = {
	themePath: '',
	theme: {},
};
let included = {};

// Default configuration
parseConfig(config, 'default');

// Get default config from dev.config.json
// build.config.json is not added to repository, so it is safe to edit.
//
// Copy build.config.json-sample to build.config.json, edit it and
// run `npm run dev` for development build or `npm run build` for production build
let defaultConfig = null;
try {
	defaultConfig = JSON.parse(
		fs.readFileSync(__dirname + '/build.config.json', 'utf8')
	);
	if (defaultConfig.theme.match(themeMatch)) {
		config.themePath = defaultConfig.theme;
	}
	defaultConfig =
		defaultConfig.config[production ? 'production' : 'development'];
	if (typeof defaultConfig !== 'string') {
		defaultConfig = null;
	}
} catch (err) {
	defaultConfig = null;
}

// Parse configuration files
// Example: UI_CONFIG=local npm run build
if (typeof process.env.UI_CONFIG === 'string') {
	setConfig(process.env.UI_CONFIG);
} else if (defaultConfig !== null) {
	setConfig(defaultConfig);
}

// Add custom theme
// Example: UI_THEME=figma npm run build
if (typeof process.env.UI_THEME === 'string') {
	const theme = process.env.UI_THEME;
	if (theme.match(themeMatch)) {
		config.themePath = theme;
	}
}

if (config.themePath === '') {
	throw new Error(
		'Missing theme name. You can set theme name using UI_THEME environment variable or by setting default theme name in build.config.json. See README.md'
	);
}
console.log(`Theme: ${config.themePath}`);
parseThemeConfig(config, config.themePath);

/**
 * Validate config
 */
normaliseConfig(config);

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
if (typeof config.language === 'string' && config.language !== 'en') {
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

// Footer
const footerFile = capitalise(config.footer.type);
try {
	const testFile = `${__dirname}/src/ui/footer/${footerFile}.svelte`;
	fs.lstatSync(testFile, 'utf8');
} catch (err) {
	throw new Error(`Invalid footer: ${config.footer.type}`);
}
replacementPairs['/footer/Simple.svelte'] = `/footer/${footerFile}.svelte`;
delete config.footer.type;

// Icon name style
if (config.footer['name-style']) {
	const iconNameFile = capitalise(config.footer['name-style']);
	try {
		const testFile = `${__dirname}/src/ui/footer/parts/name/${iconNameFile}.svelte`;
		fs.lstatSync(testFile, 'utf8');
	} catch (err) {
		throw new Error(
			`Invalid name-style value: ${config.footer['name-style']}`
		);
	}
	replacementPairs['/parts/name/Simple.svelte'] =
		'/parts/name/' + iconNameFile + '.svelte';
}
delete config.footer['name-style'];

// Shorten icon name when viewing collection
if (config.footer['shorter-name'] === false) {
	replacementPairs['canShortenName = true'] = 'canShortenName = false';
}

// Footer options
replacementPairs['footerOptions = {}'] =
	'footerOptions = ' + JSON.stringify(config.footer);

// Icon properties
replacementPairs['ExtendedIconProperties = {}'] =
	'ExtendedIconProperties = ' + JSON.stringify(config.iconProps);

if (!Object.keys(config.iconProps).length) {
	replacementPairs['./parts/Properties.svelte'] = '../Empty.svelte';
	replacementPairs['canShowIconProperties = true'] =
		'canShowIconProperties = false';
} else {
	if (config.iconPropsTitle) {
		replacementPairs['showPropsTitle = false'] = 'showPropsTitle = true';
	}
	// Replace unused properties
	const tests = [
		{
			test: ['color'],
			replace: 'Color.svelte',
			const: 'canShowColorProp',
		},
		{
			test: ['rotate'],
			replace: 'Rotate.svelte',
			const: 'canShowRotateProp',
		},
		{
			test: ['width', 'height'],
			replace: 'Size.svelte',
			const: 'canShowSizeProp',
		},
		{
			test: ['hFlip'],
			replace: 'Flip.svelte',
			const: 'canShowFlipProp',
		},
	];

	tests.forEach(item => {
		let exists = false;
		item.test.forEach(key => {
			if (config.iconProps[key]) {
				exists = true;
			}
		});
		if (!exists) {
			if (item.replace) {
				replacementPairs['/props/' + item.replace] =
					'/props/Empty.svelte';
			}
			if (item.const) {
				replacementPairs[item.const + ' = true'] =
					item.const + ' = false';
			}
		}
	});
}

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
function merge(target, source, parentKey = '') {
	Object.keys(source).forEach(key => {
		if (target[key] === void 0) {
			target[key] = source[key];
			return;
		}

		// Overwrite all children keys
		if (overwriteChildenConfig.indexOf(parentKey) !== -1) {
			target[key] = source[key];
			return;
		}

		// Merge children
		switch (typeof source[key]) {
			case 'object':
				if (typeof target[key] !== 'object') {
					// Object overrides non-object
					target[key] = source[key];
					return;
				}
				// Merge objects
				merge(target[key], source[key], key);
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
	const files = str
		.split(',')
		.map(item => item.trim())
		.filter(item => item.match(/^[a-z0-9_.-]+$/g));

	console.log(`Configuration: ${files.join(', ')}`);
	files.forEach(file => {
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

/**
 * Capitalise text
 */
function capitalise(text) {
	return text
		.split('-')
		.map(item => item.slice(0, 1).toUpperCase() + item.slice(1))
		.join('');
}

/**
 * Normalise config
 */
function normaliseConfig(config) {
	// Check theme
	const theme = config.theme;
	if (typeof theme.rotation !== 'number' || !theme.rotation) {
		throw new Error('Theme error: "rotation" should be a number.');
	}

	// Check footer type
	if (typeof config.footer !== 'object' || config.footer === null) {
		config.footer = {
			type: typeof config.footer === 'string' ? config.footer : 'none',
			buttons: false,
		};
	}

	// Convert footer buttons list to objects
	const footer = config.footer;
	switch (typeof footer.buttons) {
		case 'string':
			// Convert from keyword
			(() => {
				const buttons = footer.buttons
					.split(/[,|]/)
					.filter(item => item !== '' && item !== 'none');
				footer.buttons = {};
				buttons.forEach(button => {
					footer.buttons[button] = true;
				});
			})();
			break;

		case 'boolean':
			// true = 'submit,cancel', false = 'none'
			footer.buttons = footer.buttons
				? {
						submit: true,
						cancel: true,
				  }
				: {};
			break;

		case 'object':
			if (footer.buttons === null) {
				footer.buttons = {};
			}
			break;

		default:
			// Unknown value
			throw new Error('Invalid value for configuration footer.buttons');
	}

	// Convert each button to object
	const buttons = footer.buttons;
	let alwaysShowButtons = false;
	Object.keys(buttons).forEach((key, index) => {
		let value = buttons[key];
		switch (typeof value) {
			case 'boolean':
				if (value) {
					// true -> {value: true}
					buttons[key] = {
						text: true,
					};
				} else {
					// false -> delete item
					delete buttons[key];
					return;
				}
				break;

			case 'string':
				// Use string as text
				buttons[key] = {
					text: value,
				};
				break;

			case 'object':
				break;

			default:
				throw new Error(
					`Invalid value for configuration footer.buttons.${key}`
				);
		}
		value = buttons[key];

		// Check button text
		switch (typeof value.text) {
			case 'boolean':
				if (value.text === false) {
					throw new Error(
						`Invalid value for configuration footer.buttons.${key}.text`
					);
				}
				// Delete entry
				delete value.text;
				break;

			case 'undefined':
			case 'string':
				break;

			default:
				throw new Error(
					`Invalid value for configuration footer.buttons.${key}.text`
				);
		}

		// Check button type
		if (typeof value.type !== 'string') {
			switch (key) {
				case 'submit':
				case 'change':
				case 'select':
					value.type = 'primary';
					break;

				case 'cancel':
				case 'close':
					value.type = 'secondary';
					break;

				case 'delete':
					value.type = 'destructive';
					break;

				default:
					// Set type based on index: primary for first button, secondary for others
					value.type = index ? 'secondary' : 'primary';
			}
		}

		// Check button icon
		if (value.icon !== void 0) {
			if (typeof value.icon !== 'string') {
				throw new Error(
					`Invalid value for configuration footer.buttons.${key}.icon (invalid type)`
				);
			}
			if (theme.icons[value.icon] === void 0) {
				// Missing icon
				if (value.icon.indexOf(':') === -1) {
					throw new Error(
						`Invalid value for configuration footer.buttons.${key}.icon (no such icon in theme)`
					);
				}
			}
		}

		// Check if buttons should always be shown (must be configured on per button basis!)
		if (value['always-visible'] === true) {
			// Rename 'always-visible' to 'always'
			value.always = value['always-visible'];
			delete value['always-visible'];
		}

		if (value.always !== true) {
			delete value.always;
		} else {
			alwaysShowButtons = true;
		}
	});
	footer.showButtons = alwaysShowButtons;
	footer.hasButtons = Object.keys(footer.buttons).length > 0;

	// Toggle empty/none type to avoid loading buttons if there are no buttons to show
	switch (footer.type) {
		case 'none':
			if (alwaysShowButtons) {
				footer.type = 'empty';
			}
			break;

		case 'empty':
			if (!alwaysShowButtons) {
				footer.type = 'none';
			}
			break;
	}

	// Check for properties
	const props = {};

	Object.keys(config.customisations ? config.customisations : {}).forEach(
		prop => {
			const customisations = config.customisations;

			switch (prop) {
				case 'flip':
					if (customisations[prop] === true) {
						props.hFlip = defaultProperties.hFlip;
						props.vFlip = defaultProperties.vFlip;
						return;
					} else if (customisations[prop] !== false) {
						throw new Error(
							`Invalid value for configuration customisations.${prop}. Expected boolean, got ${typeof customisations[
								prop
							]}`
						);
					}
					return;

				case 'hFlip':
				case 'vFlip':
					throw new Error(
						`Invalid configuration customisations.${prop}. To enable or disable flip, use customisations.flip = true or customisations.flip = false.`
					);
			}

			if (defaultProperties[prop] === void 0) {
				return;
			}

			if (
				customisations[prop] === null ||
				customisations[prop] === false
			) {
				// Disabled
				return;
			}

			// Property exists
			let configItem = customisations[prop];
			const defaultItem = defaultProperties[prop];

			if (configItem === true) {
				// Empty object, all values will be assigned later
				configItem = {};
			}

			if (typeof configItem === 'object') {
				// Object - check for defaultValue and value
				let item = configItem;
				if (item.defaultValue === void 0) {
					item.defaultValue = defaultItem.defaultValue;
				}
				if (item.emptyValue === void 0) {
					item.emptyValue =
						defaultItem.emptyValue === void 0
							? defaultItem.defaultValue
							: defaultItem.emptyValue;
				}
				delete item.value;
				props[prop] = item;
				return;
			}

			// Convert value
			if (typeof configItem !== typeof defaultItem.defaultValue) {
				throw new Error(
					`Invalid value for configuration customisations.${prop}. Expected ${typeof defaultItem.defaultValue}, got ${typeof configItem}`
				);
			}

			// Check value
			switch (prop) {
				case 'color':
					// different string, test if its a color
					(() => {
						const color = colors.fromString(configItem);
						if (color) {
							configItem = color.toString();
						} else {
							throw new Error(
								`Invalid value for configuration customisations.color`
							);
						}
					})();
					break;
			}

			// Set value as default value
			const item = defaultItem;
			if (item.emptyValue === void 0) {
				item.emptyValue = item.defaultValue;
			}
			item.defaultValue = configItem;
			props[prop] = item;
		}
	);

	// Show title?
	if (Object.keys(props)) {
		config.iconPropsTitle = config.customisations.title;
	}

	delete config.customisations;
	config.iconProps = props;
	console.log('Props:', props);
}
