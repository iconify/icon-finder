import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import { iconifyIconVersion } from '../versions';
import {
	addAttr,
	degrees,
	docsWebsite,
	getCustomisationsList,
	isNumber,
	mergeAttr,
	mergeAttributes,
	ParserAttr,
	toString,
} from './common';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types';


// Documentation links
const docs: IconifyCodeDocs = {
	type: 'iconify-icon',
	href: docsWebsite + 'iconify-icon/',
};

// Head section
let head: string | undefined;

/**
 * Code output for web component
 */
export const webComponentParser: CodeParser = (
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

	// Parse all customisations
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			// Color
			case 'color':
				mergeAttr(
					list,
					'style',
					'color: ' + customisations[attr] + ';',
					' '
				);
				break;

			// Dimensions
			case 'width':
			case 'height':
				addAttr(list, attr, toString(customisations[attr]));
				break;

			case 'onlyHeight': {
				const value = customisations.height;
				mergeAttr(
					list,
					'style',
					'font-size: ' + value + (isNumber(value) ? 'px;' : ';'),
					' '
				);
				break;
			}

			// Transformations
			case 'rotate':
				addAttr(list, attr, degrees(customisations[attr]));
				break;

			case 'hFlip':
				mergeAttr(list, 'flip', 'horizontal', ',');
				break;

			case 'vFlip':
				mergeAttr(list, 'flip', 'vertical', ',');
				break;
		}
	});

	// Generate HTML
	const html = '<iconify-icon ' + (customisations.inline ? 'inline ' : '') + mergeAttributes(list) + '></iconify-icon>';

	// Head script
	if (head === void 0) {
		head =
			'<script src="https://code.iconify.design/iconify-icon/' +
			iconifyIconVersion +
			'/iconify-icon.min.js"><' +
			'/script>';
	}

	const result: CodeOutput = {
		html: {
			head,
			html,
		},
		isAPI: true,
		docs,
	};
	return result;
};
