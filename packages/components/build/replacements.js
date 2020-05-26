const fs = require('fs');
const path = require('path');

const sourceDir = path.dirname(__dirname) + '/src';
const requiredIcons = ['reset', 'search', 'parent', 'grid', 'list'];

// Default footer buttons
const defaultFooterButtons = {
	submit: {
		type: 'primary',
	},
	cancel: {
		type: 'secondary',
	},
};

/**
 * Capitalise text
 */
function capitalise(text) {
	return text
		.split('-')
		.map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
		.join('');
}

/**
 * Theme specific replacements
 */
function themeReplacements(replacements, config) {
	const theme = config.themeData;

	// Colors rotation
	replacements['maxIndex = 10'] = 'maxIndex = ' + Math.max(1, theme.rotation);

	// Focus search
	if (!theme['focus-search']) {
		replacements['canFocusSearch = true'] = 'canFocusSearch = false';
	}

	// Collections list
	if (!theme['collections-list-author-link']) {
		replacements['authorLink = true'] = 'authorLink = false';
	}
	if (theme['collections-list-clickable']) {
		replacements['collectionClickable = false'] =
			'collectionClickable = true';
	}

	// Icons
	if (typeof theme.icons !== 'object') {
		throw new Error('Theme configuration error: missing "icons" object.');
	}
	requiredIcons.forEach((icon) => {
		if (theme.icons[icon] === void 0) {
			throw new Error(`Theme configuration error: missing icon "${icon}`);
		}
	});
	replacements['uiIcons = {}'] = 'uiIcons = ' + JSON.stringify(theme.icons);
}

/**
 * Toggle views
 */
function toggleViews(replacements, config) {
	if (!config.views) {
		return;
	}

	// Disable custom view
	if (config.views.custom === false) {
		replacements['supportCustomView = true'] = 'supportCustomView = false';
		replacements['./views/Custom.svelte'] = './Empty.svelte';
	}
}

/**
 * Other stuff
 */
function miscStuff(replacements, config) {
	// Language
	if (typeof config.language === 'string' && config.language !== 'en') {
		replacements['/phrases/en'] = '/phrases/' + config.language;
	}

	// Options
	if (typeof config.options === 'object') {
		replacements['options = {}'] =
			'options = ' + JSON.stringify(config.options);
	}
}

/**
 * Layout replacements
 */
function layoutReplacements(replacements, config) {
	// Shorten icon name when viewing collection
	if (config.layout.canShortenName === false) {
		replacements['canShortenName = true'] = 'canShortenName = false';
	}
}

/**
 * Footer
 */
function footerReplacements(replacements, config) {
	// Check if buttons are visible
	const showButtons = footerButtons(replacements, config);

	// Generate options list
	const footerOptions = {
		showButtons: showButtons,
	};
	if (showButtons) {
		footerOptions.buttons = config.footer.buttons;
	}

	// Get footer file and make sure it exists
	const footerComponent = capitalise(
		config.showFooter
			? config.footer.components.footer
			: showButtons
			? 'empty'
			: 'none'
	);

	try {
		const testFile = `${sourceDir}/ui/footer/${footerComponent}.svelte`;
		fs.lstatSync(testFile, 'utf8');
	} catch (err) {
		throw new Error(`Invalid footer component: ${footerComponent}`);
	}
	replacements['/footer/Simple.svelte'] = `/footer/${footerComponent}.svelte`;

	// Options
	if (config.showFooter) {
		// Name component
		const footerNameComponent = capitalise(config.footer.components.name);

		try {
			const testFile = `${sourceDir}/ui/footer/parts/name/${footerNameComponent}.svelte`;
			fs.lstatSync(testFile, 'utf8');
		} catch (err) {
			throw new Error(
				`Invalid footer name component: ${footerNameComponent}`
			);
		}
		replacements['/parts/name/Simple.svelte'] =
			'/parts/name/' + footerNameComponent + '.svelte';

		// Copy options
		['fullSample'].forEach((prop) => {
			if (config.footer[prop] !== void 0) {
				footerOptions[prop] = config.footer[prop];
			}
		});
	}

	// Customisations
	footerCustomisations(replacements, config);

	// Footer options replacement
	replacements['footerOptions = {}'] =
		'footerOptions = ' + JSON.stringify(footerOptions);
}

/**
 * Footer buttons
 */
function footerButtons(replacements, config) {
	let showButtons = config.showFooter && config.footer.showButtons;

	// Validate buttons
	if (showButtons) {
		if (!Object.keys(config.footer.buttons).length) {
			// Default buttons
			config.footer.buttons = defaultFooterButtons;
		}
	}

	return showButtons;
}

/**
 * Customisations
 */
function footerCustomisations(replacements, config) {
	const footerConfig = config.footer;
	const customisationsConfig = footerConfig.customisations;

	let showCustomisations =
		config.showFooter && footerConfig.showCustomisations;
	if (showCustomisations) {
		const enabledItems = Object.keys(customisationsConfig).filter(
			(key) => customisationsConfig[key]
		);
		if (!enabledItems.length) {
			showCustomisations = false;
		}
	}

	if (!showCustomisations) {
		// Disable customisations
		replacements['./parts/Properties.svelte'] = '../Empty.svelte';
		replacements['canShowIconProperties = true'] =
			'canShowIconProperties = false';
		return false;
	}

	// Enabled
	if (footerConfig.showCustomisationsTitle) {
		replacements['showPropsTitle = false'] = 'showPropsTitle = true';
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

	tests.forEach((item) => {
		let exists = false;
		item.test.forEach((key) => {
			if (customisationsConfig[key]) {
				exists = true;
			}
		});
		if (!exists) {
			if (item.replace) {
				replacements['/props/' + item.replace] = '/props/Empty.svelte';
			}
			if (item.const) {
				replacements[item.const + ' = true'] = item.const + ' = false';
			}
		}
	});

	return true;
}

/**
 * Get replacements for config
 */
module.exports = (config) => {
	const replacements = {};

	miscStuff(replacements, config);
	themeReplacements(replacements, config);
	toggleViews(replacements, config);
	footerReplacements(replacements, config);
	layoutReplacements(replacements, config);

	return replacements;
};
