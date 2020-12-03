import type { CodeSampleTitles } from './types';

/**
 * Code sample tab and mode titles
 *
 * This list contains only items that require custom text.
 * Everything else will be capitalized using capitalize() function, such as 'vue2' changed to 'Vue 2'
 */
export const codeSampleTitles: CodeSampleTitles = {
	'iconify': 'SVG Framework',
	'svg': 'SVG',
	'svg-raw': 'SVG',
	'svg-box': 'SVG with viewBox rectangle',
	'svg-uri': 'SVG as data: URI',
	'react-npm': 'React',
	'react-api': 'React with Iconify API',
};

/**
 * Add / replace custom sample titles
 */
export function translateCodeSampleTitles(translation: CodeSampleTitles): void {
	for (const key in translation) {
		const attr = key as keyof CodeSampleTitles;
		codeSampleTitles[attr] = translation[attr];
	}
}
