import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import { componentPackages, getComponentInstall } from '../versions';
import {
	addAttr,
	addReactAttr,
	docsBase,
	getCustomisationsList,
	iconToVarName,
	mergeAttributes,
	npmIconImport,
	ParserAttr,
} from './common';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types';

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'svelte',
	href: docsBase + 'svelte/',
};

// Code cache
const installCode = getComponentInstall('svelte', true);
const importCode = "import Icon from '" + componentPackages.svelte.name + "';";

/**
 * Add properties and generate code
 */
function generateCode(
	list: ParserAttr,
	customisations: IconCustomisations
): string {
	// Parse all customisations
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			case 'onlyHeight': {
				const value = customisations.height;
				addReactAttr(list, 'height', value);
				break;
			}

			default:
				addReactAttr(list, attr, customisations[attr]);
		}
	});

	return '<Icon ' + mergeAttributes(list) + ' />';
}

/**
 * Code output for API component
 */
export const svelteParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (!providerConfig.api) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add icon name
	addAttr(list, 'icon', iconToString(icon));

	// Generate code
	const code = generateCode(list, customisations);

	const result: CodeOutput = {
		component: {
			'install-simple': installCode,
			'import-simple': importCode,
			'use-in-template': code,
		},
		isAPI: true,
		docs,
	};
	return result;
};

/**
 * Code output for offline component
 */
export const svelteOfflineParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (!providerConfig.npmCJS && !providerConfig.npmES) {
		return null;
	}

	// Variable name
	const varName = iconToVarName(icon.name);

	// Import statement
	const npmImport = npmIconImport(icon, varName, providerConfig, false);
	if (!npmImport) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add icon name
	addReactAttr(list, 'icon', varName);

	// Generate code
	const code = generateCode(list, customisations);

	const result: CodeOutput = {
		component: {
			'install-offline': installCode + ' ' + npmImport.package,
			'import-offline': importCode + '\n' + npmImport.code,
			'use-in-template': code,
		},
		isAPI: false,
		docs,
	};
	return result;
};
