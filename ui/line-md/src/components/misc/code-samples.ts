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
		// Add link to footer
		result.footer = {
			text:
				'Do not forget to add stylesheet to your page if you want animated icons:',
			code:
				'<link rel="stylesheet" href="https://code.iconify.design/css/line-md.css">',
		};

		// Modify code
		if (result.component) {
			if (typeof result.component.use === 'string') {
				// Add class
				result.component.use = result.component.use
					// Rect and Svelte
					.replace(
						'Icon icon={',
						'Icon class' +
							(lang === 'svelte' ? '' : 'Name') +
							'="iconify--line-md" icon={'
					)
					// Vue
					.replace(
						'Icon :icon',
						'Icon class="iconify--line-md" :icon'
					);
			}
		}
	}

	return result;
}
