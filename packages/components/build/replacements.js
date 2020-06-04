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
 * Check if source file exists
 */
function sourceFileExists(config, filename) {
	let sourceDirs = [sourceDir];
	if (config.customFilesDir !== '') {
		sourceDirs.unshift(config.customFilesDir);
	}

	for (let i = 0; i < sourceDirs.length; i++) {
		try {
			const testFile = sourceDirs[i] + filename;
			fs.lstatSync(testFile, 'utf8');
			return true;
		} catch (err) {}
	}
	return false;
}

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

	if (!sourceFileExists(config, `/ui/footer/${footerComponent}.svelte`)) {
		throw new Error(`Invalid footer component: ${footerComponent}`);
	}
	replacements['/footer/Simple.svelte'] = `/footer/${footerComponent}.svelte`;

	// Options
	if (config.showFooter) {
		// Name component
		const footerNameComponent = capitalise(config.footer.components.name);

		if (
			!sourceFileExists(
				config,
				`/ui/footer/parts/name/${footerNameComponent}.svelte`
			)
		) {
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
	console.log(footerOptions);
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
	const customisations = {};

	let showCustomisations =
		config.showFooter && footerConfig.showCustomisations;
	if (showCustomisations) {
		const enabledItems = Object.keys(customisationsConfig).filter(
			(key) => customisationsConfig[key].show
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
		return void 0;
	}

	// Enabled
	if (footerConfig.showCustomisationsTitle) {
		replacements['showPropsTitle = false'] = 'showPropsTitle = true';
	}

	// Parse all properties
	Object.keys(customisationsConfig).forEach((key) => {
		const item = customisationsConfig[key];
		const varName = key.slice(0, 1).toUpperCase() + key.slice(1);
		if (!item.show) {
			// Disable
			replacements[
				`customise${varName} = true`
			] = `customise${varName} = false`;

			// Replace with empty component to avoid bundling it
			replacements[
				`/props/${key}/${varName}.svelte`
			] = `/props/Empty.svelte`;
			return;
		}

		// Replace component
		if (typeof item.component === 'string' && item.component !== key) {
			const replacementName =
				item.component.slice(0, 1).toUpperCase() +
				item.component.slice(1);
			replacements[
				`/props/${key}/${varName}.svelte`
			] = `/props/${key}/${replacementName}.svelte`;
		}

		// Replace other properties
		Object.keys(item).forEach((attr) => {
			if (attr === 'show' || attr === 'component') {
				return;
			}

			const value = item[attr];
			const customValue = JSON.stringify(value);

			// List of possible old values
			let possibleDefaultValues = [];

			switch (typeof value) {
				case 'boolean':
					// toggle boolean value
					possibleDefaultValues.push(JSON.stringify(!value));
					break;

				case 'number':
					// Assume default number is 0
					possibleDefaultValues.push('0');
					break;

				case 'string':
					// Assume default value is empty string
					possibleDefaultValues.push("''");
					possibleDefaultValues.push('""');
					break;

				default:
					return;
			}

			// Attribute specific old values
			/*
			switch (attr) {
			}
			*/

			possibleDefaultValues.forEach((defaultValue) => {
				replacements[
					`${attr} = ${defaultValue}`
				] = `${attr} = ${customValue}`;
			});
		});
	});

	return;
}

/**
 * Add provider replacements
 */
function providerReplacements(replacements, config) {
	const providerConfig = config.providers;

	// Custom providers
	if (providerConfig.custom && Object.keys(providerConfig.custom).length) {
		replacements['customProviders = {}'] =
			'customProviders = ' + JSON.stringify(providerConfig.custom);

		// Change default provider
		if (providerConfig.default !== '') {
			const defaultProvider = providerConfig.default;
			if (providerConfig.custom[defaultProvider] !== void 0) {
				replacements["defaultProvider = ''"] =
					"defaultProvider = '" + defaultProvider + "'";
			}
		}
	} else {
		// No custom providers
		replacements['importProviders(customProviders);'] = '';
		replacements['/misc/import-providers'] = '/misc/import-providers-empty';
	}
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
	providerReplacements(replacements, config);

	return replacements;
};
