import { lstatSync } from 'fs';
import { dirname } from 'path';
import { IconFinderConfig } from '@iconify/search-configurator/lib/config/full';
import { CustomFiles } from '@iconify/search-configurator/lib/parse/custom-files';
import {
	IconFinderComponentsConfig,
	FooterButton,
	IconFinderConfigFooterSample,
} from './config';

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
 * Types for various stuff
 */
interface FooterOptions {
	showButtons: boolean;
	buttons?: Record<string, FooterButton>;
	fullSample?: IconFinderConfigFooterSample;
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
 * Get replacements
 */
export function getReplacements(
	fullConfig: IconFinderConfig,
	customFiles: CustomFiles | null
): Record<string, string> {
	// Expand config
	const components = (fullConfig.components as unknown) as IconFinderComponentsConfig;
	const theme = fullConfig.theme;

	// Custom files and directory for local files
	const customFileNames = customFiles
		? customFiles.files.map((item) => item.filename)
		: [];
	const sourcePath = dirname(__dirname) + '/src';
	// console.log('sourcePath:', sourcePath);

	// Replacements
	const replacements = Object.create(null);

	/**
	 * Check if source file exists
	 */
	function sourceFileExists(filename: string): boolean {
		// Check custom files
		if (customFileNames.indexOf(filename) !== -1) {
			return true;
		}

		// Check local files
		try {
			lstatSync(sourcePath + filename);
			return true;
		} catch (err) {
			//
		}

		return false;
	}

	/**
	 * Theme specific replacements
	 */
	function themeReplacements() {
		// Colors rotation
		replacements['maxIndex = 10'] =
			'maxIndex = ' + Math.max(1, theme.rotation + 1);
		// console.log('Rotation:', theme.rotation);

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
		// Disable custom view
		if (components.views.custom === false) {
			replacements['supportCustomView = true'] =
				'supportCustomView = false';
			replacements['./views/Custom.svelte'] = './Empty.svelte';
		}
	}

	/**
	 * Layout replacements
	 */
	function layoutReplacements() {
		// Shorten icon name when viewing collection
		if (components.canShortenName === false) {
			replacements['canShortenName = true'] = 'canShortenName = false';
			replacements['/misc/shorten-icon-name'] =
				'/misc/shorten-icon-name-empty';
		}

		// Focus search
		if (!components.focusSearch) {
			replacements['canFocusSearch = true'] = 'canFocusSearch = false';
		}

		// Collections list
		if (!components.collectionsList.authorLink) {
			replacements['authorLink = true'] = 'authorLink = false';
		}
		if (components.collectionsList.clickable) {
			replacements['collectionClickable = false'] =
				'collectionClickable = true';
		}

		// Collection view
		if (!components.collectionView.showInfo) {
			replacements['showCollectionInfoBlock = true'] =
				'showCollectionInfoBlock = false';
			replacements['../blocks/CollectionInfo.svelte'] = '../Empty.svelte';
		}
	}

	/**
	 * Footer buttons
	 */
	function footerButtons() {
		let showButtons =
			components.showFooter && components.footer.showButtons;

		// Validate buttons
		if (showButtons) {
			if (!Object.keys(components.footer.buttons).length) {
				// Default buttons
				components.footer.buttons = defaultFooterButtons;
			}
		}

		return showButtons;
	}

	/**
	 * Customisations
	 */
	function footerCustomisations() {
		const footerConfig = components.footer;
		const customisationsConfig = footerConfig.customisations;

		let showCustomisations =
			components.showFooter && footerConfig.showCustomisations;
		if (showCustomisations) {
			const enabledItems = Object.keys(customisationsConfig).filter(
				(key) =>
					customisationsConfig[
						key as keyof typeof customisationsConfig
					].show
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
			const item =
				customisationsConfig[key as keyof typeof customisationsConfig];
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

				const value = item[attr as keyof typeof item];
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
			footerOptions.buttons = components.footer.buttons;
		}

		// Get footer file and make sure it exists
		const footerComponent = capitalise(
			components.showFooter
				? components.footer.components.footer
				: showButtons
				? 'empty'
				: 'none'
		);

		if (!sourceFileExists(`/ui/footer/${footerComponent}.svelte`)) {
			throw new Error(`Invalid footer component: ${footerComponent}`);
		}
		replacements[
			'/footer/Simple.svelte'
		] = `/footer/${footerComponent}.svelte`;

		// Options
		if (components.showFooter) {
			// Name component
			const footerNameComponent = capitalise(
				components.footer.components.name
			);

			if (
				!sourceFileExists(
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
			footerOptions.fullSample = components.footer.fullSample;
		}

		// Customisations
		footerCustomisations();

		// Code
		if (!components.footer.showCode) {
			replacements['canShowIconCode = true'] = 'canShowIconCode = false';
			replacements['./parts/Code.svelte'] = '../Empty.svelte';
		}

		// Footer options replacement
		// console.log(footerOptions);
		replacements['footerOptions = {}'] =
			'footerOptions = ' + JSON.stringify(footerOptions);
	}

	/**
	 * Add provider replacements
	 */
	function providerReplacements() {
		const providerConfig = fullConfig.common.providers;

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

	/**
	 * Other stuff
	 */
	function miscStuff() {
		// Language
		if (
			typeof components.language === 'string' &&
			components.language !== 'en'
		) {
			replacements['/phrases/en'] = '/phrases/' + components.language;
		}
		if (Object.keys(components.phrases).length > 0) {
			replacements['customPhrases = {}'] =
				'customPhrases = ' + JSON.stringify(components.phrases);
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
