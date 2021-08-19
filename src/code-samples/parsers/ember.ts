import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import { getComponentInstall } from '../versions';
import {
	addEmberAttr,
	docsBase,
	getCustomisationsList,
	mergeAttributes,
	ParserAttr,
} from './common';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types';

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'ember',
	href: docsBase + 'ember/',
};

// Code cache
const installCode = getComponentInstall('ember', true);

/**
 * Code output for API component
 */
export const emberParser: CodeParser = (
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
	addEmberAttr(list, 'icon', iconToString(icon));

	// Params
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			case 'onlyHeight': {
				const value = customisations.height;
				addEmberAttr(list, 'height', value);
				break;
			}

			default:
				addEmberAttr(list, attr, customisations[attr]);
		}
	});

	// Generate code
	const code = '<IconifyIcon ' + mergeAttributes(list) + ' />';

	const result: CodeOutput = {
		component: {
			'install-addon': installCode,
			'use-in-template': code,
		},
		isAPI: true,
		docs,
	};
	return result;
};
