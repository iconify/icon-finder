import type { IconCustomisations } from '../../misc/customisations';
import type { Icon } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';
import {
	addAttr,
	degrees,
	docsBase,
	getCustomisationsList,
	mergeAttr,
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
	type: 'css',
	href: docsBase + 'css.html',
};

/**
 * Code output for CSS
 */
export const cssParser: CodeParser = (
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
) => {
	if (typeof providerConfig.svg !== 'string') {
		return null;
	}

	// Parse all customisations
	const list: ParserAttr = {};
	getCustomisationsList(customisations).forEach((attr) => {
		switch (attr) {
			// Ignore
			case 'inline':
				break;

			// Color
			case 'color':
				addAttr(list, 'color', customisations[attr]);
				break;

			// Dimensions
			case 'width':
			case 'height':
				addAttr(list, attr, toString(customisations[attr]));
				break;

			case 'onlyHeight':
				addAttr(list, 'height', toString(customisations.height));
				break;

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

			// Alignment
			case 'hAlign':
			case 'vAlign':
				mergeAttr(list, 'align', customisations[attr], ',');
				break;

			case 'slice':
				mergeAttr(list, 'align', attr, ',');
				break;

			default:
				assertNever(attr);
		}
	});

	// Generate params
	const params = Object.keys(list)
		.map((key) => {
			const item = list[key];
			if (typeof item === 'object') {
				return item.key + '=' + encodeURIComponent(item.value);
			}
			return key + '=' + encodeURIComponent(item);
		})
		.join('&');

	// Get URL
	const url =
		providerConfig.svg
			.replace('{prefix}', icon.prefix)
			.replace('{name}', icon.name) + (params ? '?' + params : '');

	const result: CodeOutput = {
		raw: [
			"background: url('" + url + "') no-repeat center center / contain;",
			"content: url('" + url + "');",
		],
		isAPI: true,
		docs,
	};
	return result;
};
