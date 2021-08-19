import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import { componentPackages, getComponentInstall } from '../versions';
import {
	addAttr,
	addVueAttr,
	docsBase,
	getCustomisationsList,
	iconToVarName,
	mergeAttributes,
	npmIconImport,
	ParserAttr,
} from './common';
import type { CodeOutput, IconifyCodeDocs } from './types';

// Documentation links
const docs2: IconifyCodeDocs = {
	type: 'vue',
	href: docsBase + 'vue2/',
};
const docs3: IconifyCodeDocs = {
	type: 'vue',
	href: docsBase + 'vue/',
};

// Code cache
const installCode2 = getComponentInstall('vue2', true);
const installCode3 = getComponentInstall('vue3', true);
const importCode2 =
	"import { Icon } from '" + componentPackages.vue2.name + "';";
const importCode3 =
	"import { Icon } from '" + componentPackages.vue3.name + "';";

const scriptCode = 'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n});';
const scriptOfflineCode =
	'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';

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
				addVueAttr(list, 'height', value);
				break;
			}

			case 'hFlip':
			case 'vFlip':
			case 'hAlign':
			case 'vAlign': {
				addVueAttr(
					list,
					(attr.slice(0, 1) === 'h' ? 'horizontal' : 'vertical') +
						attr.slice(1),
					customisations[attr]
				);
				break;
			}

			default:
				addVueAttr(list, attr, customisations[attr]);
		}
	});

	return '<Icon ' + mergeAttributes(list) + ' />';
}

/**
 * Code output for API component
 */
export function vueParser(
	vue3: boolean,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
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
			'install-simple': vue3 ? installCode3 : installCode2,
			'import-simple': vue3 ? importCode3 : importCode2,
			'use-in-template': code,
			'vue-simple': scriptCode,
		},
		isAPI: true,
		docs: vue3 ? docs3 : docs2,
	};
	return result;
}

/**
 * Code output for offline component
 */
export function vueOfflineParser(
	vue3: boolean,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
	if (!providerConfig.npmCJS && !providerConfig.npmES) {
		return null;
	}

	// Variable name
	const varName = iconToVarName(icon.name);

	// Import statement
	const npmImport = npmIconImport(icon, varName, providerConfig, vue3);
	if (!npmImport) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add icon name
	addVueAttr(list, 'icon', 'icons.' + varName);

	// Generate code
	const code = generateCode(list, customisations);

	const result: CodeOutput = {
		component: {
			'install-offline':
				(vue3 ? installCode3 : installCode2) + ' ' + npmImport.package,
			'import-offline':
				(vue3 ? importCode3 : importCode2) + '\n' + npmImport.code,
			'use-in-template': code,
			'vue-offline': scriptOfflineCode.replace('{varName}', varName),
		},
		isAPI: false,
		docs: vue3 ? docs3 : docs2,
	};
	return result;
}
