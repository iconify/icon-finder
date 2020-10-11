// Import everything from .default
import {
	IconifyCodeDocs,
	CustomCodeOutput,
	IconifyCodeOutput,
	CodeOutput,
	getIconCode as getIconCodeParent,
} from './code-samples.default';

// Imports will throw errors in editor, but they do work
import { ProviderCodeData } from './code-config';
import { AvailableLanguages } from './code-tree';
import { IconCustomisations } from './customisations';

// Export parent stuff
export { IconifyCodeDocs, CustomCodeOutput, IconifyCodeOutput, CodeOutput };

// Export modified function
export function getIconCode(
	lang: AvailableLanguages,
	iconName: string,
	iconCustomisations: IconCustomisations,
	providerConfig: ProviderCodeData
): CodeOutput | null {
	const result = getIconCodeParent(
		lang,
		iconName,
		iconCustomisations,
		providerConfig
	);
	if (result && lang !== 'svg-uri') {
		result.footer = {
			text:
				'Do not forget to add stylesheet to your page if you want animated icons:',
			code:
				'<link rel="stylesheet" href="https://code.iconify.design/css/line-md.css">',
		};
	}

	return result;
}
