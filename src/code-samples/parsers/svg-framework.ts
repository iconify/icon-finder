import { Iconify } from '../../iconify';
import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import { iconifyVersion } from '../versions';
import {
	addAttr,
	degrees,
	docsBase,
	getCustomisationsList,
	isNumber,
	mergeAttr,
	mergeAttributes,
	ParserAttr,
	toString,
} from './common';
import type { CodeOutput, CodeParser, IconifyCodeDocs } from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental
function assertNever(v: never) {
	//
}

// Documentation links
const docs: IconifyCodeDocs = {
	type: 'iconify',
	href: docsBase + 'svg-framework/',
};

// Head section
let head: string | undefined;

/**
 * Code output for SVG Framework
 */
export const svgFrameworkParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (!providerConfig.api) {
		return null;
	}

	// List of attributes
	const list: ParserAttr = {};

	// Add class
	addAttr(
		list,
		'class',
		customisations.inline ? 'iconify-inline' : 'iconify'
	);

	// Add icon name
	addAttr(list, 'data-icon', iconToString(icon));

	// Parse all customisations
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			case 'inline':
				break;

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
				addAttr(list, 'data-width', toString(customisations[attr]));
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

			case 'height':
				addAttr(list, 'data-height', toString(customisations[attr]));
				break;

			// Transformations
			case 'rotate':
				addAttr(list, 'data-rotate', degrees(customisations[attr]));
				break;

			case 'hFlip':
				mergeAttr(list, 'data-flip', 'horizontal', ',');
				break;

			case 'vFlip':
				mergeAttr(list, 'data-flip', 'vertical', ',');
				break;

			// Alignment
			case 'hAlign':
			case 'vAlign':
				mergeAttr(list, 'data-align', customisations[attr], ',');
				break;

			case 'slice':
				mergeAttr(list, 'data-align', attr, ',');
				break;

			default:
				assertNever(attr);
		}
	});

	// Generate HTML
	const html = '<span ' + mergeAttributes(list) + '></span>';

	// Head script
	if (head === void 0) {
		const str = Iconify.getVersion ? Iconify.getVersion() : iconifyVersion;
		head =
			'<script src="https://code.iconify.design/' +
			str.split('.').shift() +
			'/' +
			str +
			'/iconify.min.js"><' +
			'/script>';
	}

	const result: CodeOutput = {
		iconify: {
			head,
			html,
		},
		isAPI: true,
		docs,
	};
	return result;
};
