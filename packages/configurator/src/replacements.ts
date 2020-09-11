import { lstatSync } from 'fs';
import { dirname } from 'path';
import {
	PreparedIconFinderConfig,
	FooterButton,
	IconFinderConfigFooterSample,
} from './config';

// Directory for source
const componentsDir = dirname(dirname(__dirname)) + '/components/src';

// Default footer buttons
const defaultFooterButtons: Record<string, FooterButton> = {
	submit: {
		type: 'primary',
	},
	cancel: {
		type: 'secondary',
	},
};

/**
 * Replacements type
 */
export type IconFinderReplacements = Record<string, string>;

/**
 * Types for various stuff
 */
interface FooterOptions {
	showButtons: boolean;
	buttons?: Record<string, FooterButton>;
	fullSample?: IconFinderConfigFooterSample;
}

/**
 * Check if source file exists
 */
function sourceFileExists(
	config: PreparedIconFinderConfig,
	filename: string
): boolean {
	let sourceDirs = [componentsDir];
	if (config.customFilesDir !== '') {
		sourceDirs.unshift(config.customFilesDir);
	}

	for (let i = 0; i < sourceDirs.length; i++) {
		try {
			const testFile = sourceDirs[i] + filename;
			lstatSync(testFile);
			return true;
		} catch (err) {}
	}
	return false;
}

/**
 * Capitalise text
 */
function capitalise(text: string): string {
	return text
		.split('-')
		.map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
		.join('');
}

/**
 * Generate replacements list from config
 */
export function generateReplacements(
	config: PreparedIconFinderConfig
): IconFinderReplacements {
	const replacements = Object.create(null);

	/**
	 * Theme specific replacements
	 */
	function themeReplacements() {
		const theme = config.themeData;

		// Colors rotation
		replacements['maxIndex = 10'] =
			'maxIndex = ' + Math.max(1, theme.rotation + 1);
		console.log('Rotation:', theme.rotation);

		// Focus search
		if (!theme.focusSearch) {
			replacements['canFocusSearch = true'] = 'canFocusSearch = false';
		}

		// Collections list
		if (theme.collectionsList && !theme.collectionsList.authorLink) {
			replacements['authorLink = true'] = 'authorLink = false';
		}
		if (theme.collectionsList && theme.collectionsList.clickable) {
			replacements['collectionClickable = false'] =
				'collectionClickable = true';
		}

		// Icons
		if (
			typeof theme.icons !== 'object' ||
			typeof theme.icons.names !== 'object'
		) {
			throw new Error(
				'Theme configuration error: missing "icons" object.'
			);
		}
		replacements['uiIcons = {}'] =
			'uiIcons = ' + JSON.stringify(theme.icons.names);

		if (typeof theme.icons.custom === 'object') {
			// Custom icons data
			const customIcons = theme.icons.custom;
			const customIconsList =
				customIcons instanceof Array ? customIcons : [customIcons];
			customIconsList.forEach((item) => {
				if (item.prefix === void 0) {
					throw new Error('Missing prefix in custom icons');
				}
			});
			replacements['uiCustomIcons = []'] =
				'uiCustomIcons = ' + JSON.stringify(customIconsList);
		}

		if (typeof theme.icons['class'] === 'string') {
			replacements["uiIconsClass = ''"] =
				"uiIconsClass = '" + theme.icons['class'] + "'";
		}
	}

	/**
	 * Toggle views
	 */
	function toggleViews() {
		if (!config.views) {
			return;
		}

		// Disable custom view
		if (config.views.custom === false) {
			replacements['supportCustomView = true'] =
				'supportCustomView = false';
			replacements['./views/Custom.svelte'] = './Empty.svelte';
		}
	}

	/**
	 * Other stuff
	 */
	function miscStuff() {
		// Language
		if (typeof config.language === 'string' && config.language !== 'en') {
			replacements['/phrases/en'] = '/phrases/' + config.language;
		}
	}

	/**
	 * Layout replacements
	 */
	function layoutReplacements() {
		// Shorten icon name when viewing collection
		if (config.layout.canShortenName === false) {
			replacements['canShortenName = true'] = 'canShortenName = false';
			replacements['/misc/shorten-icon-name'] =
				'/misc/shorten-icon-name-empty';
		}
	}

	/**
	 * Footer
	 */
	function footerReplacements() {
		// Check if buttons are visible
		const showButtons = footerButtons();

		// Generate options list
		const footerOptions: FooterOptions = {
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
		replacements[
			'/footer/Simple.svelte'
		] = `/footer/${footerComponent}.svelte`;

		// Options
		if (config.showFooter) {
			// Name component
			const footerNameComponent = capitalise(
				config.footer.components.name
			);

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
		footerCustomisations();

		// Footer options replacement
		console.log(footerOptions);
		replacements['footerOptions = {}'] =
			'footerOptions = ' + JSON.stringify(footerOptions);
	}

	/**
	 * Footer buttons
	 */
	function footerButtons() {
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
	function footerCustomisations() {
		const footerConfig = config.footer;
		const customisationsConfig = footerConfig.customisations;

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
	function providerReplacements() {
		const providerConfig = config.providers;

		// Show providers
		if (!providerConfig.show) {
			replacements['./blocks/Providers.svelte'] = './Empty.svelte';
			replacements['canShowProviders = true'] =
				'canShowProviders = false';
		}

		// Custom providers
		if (
			providerConfig.custom &&
			Object.keys(providerConfig.custom).length
		) {
			replacements['customProviders = {}'] =
				'customProviders = ' + JSON.stringify(providerConfig.custom);
			replacements[
				'customProviders: Record<string, APIProviderRawData> = {}'
			] =
				"customProviders: Record<string, APIProviderRawData> = JSON.parse('" +
				JSON.stringify(providerConfig.custom) +
				"')";

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
			replacements['/misc/import-providers'] =
				'/misc/import-providers-empty';
			replacements['./import-providers'] = './import-providers-empty';
		}

		// Can add providers
		if (providerConfig.canAdd) {
			replacements['canAddProviders = false'] = 'canAddProviders = true';
		}
	}

	// Add replacements
	miscStuff();
	themeReplacements();
	toggleViews();
	footerReplacements();
	layoutReplacements();
	providerReplacements();

	return replacements;
}
