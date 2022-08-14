import { capitalize } from '../misc/capitalize';
import type { CodeSampleKey, CodeSampleTitles } from './types';

/**
 * Code sample tab and mode titles
 *
 * This list contains only items that require custom text.
 * Everything else will be capitalized using capitalizeCodeSampleTitle() function, such as 'vue2' changed to 'Vue 2'
 */
export const codeSampleTitles: CodeSampleTitles = {
	'iconify': 'SVG Framework',
	'iconify-icon': 'Web Component',
	'html': 'HTML',
	'css': 'CSS',
	'svg': 'SVG',
	'svg-raw': 'SVG',
	'svg-box': 'SVG with viewBox rectangle',
	'svg-uri': 'SVG as data: URI',
	'react-offline': 'React (offline)',
	'react-api': 'React',
	'vue2-offline': 'Vue 2 (offline)',
	'vue2-api': 'Vue 2',
	'offline': '(offline)',
};

/**
 * Capitalize code sample title
 */
export function capitalizeCodeSampleTitle(key: CodeSampleKey): string {
	const customValue = codeSampleTitles[key];
	if (customValue !== void 0) {
		return customValue;
	}

	// Check for '-offline' and '-api'
	const parts = key.split('-');
	if (parts.length > 1) {
		const lastPart = parts.pop();
		const testKey = parts.join('-') as CodeSampleKey;
		switch (lastPart) {
			case 'offline':
				return (
					capitalizeCodeSampleTitle(testKey) +
					' ' +
					codeSampleTitles.offline
				);

			case 'api':
				return capitalizeCodeSampleTitle(testKey);
		}
	}

	// Return capitalised value
	return capitalize(key);
}

/**
 * Add / replace custom sample titles
 */
export function translateCodeSampleTitles(translation: CodeSampleTitles): void {
	for (const key in translation) {
		const attr = key as keyof CodeSampleTitles;
		codeSampleTitles[attr] = translation[attr];
	}
}
