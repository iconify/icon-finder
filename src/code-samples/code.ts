import type { IconCustomisations } from '../misc/customisations';
import type { Icon } from '../misc/icon';
import type { CodeSampleAPIConfig, CodeSampleMode } from './types';
import type {
	CodeOutput,
	CodeParser,
	ComponentCodeOutput,
} from './parsers/types';
import { cssParser } from './parsers/css';
import { emberParser } from './parsers/ember';
import { reactOfflineParser, reactParser } from './parsers/react';
import { svelteOfflineParser, svelteParser } from './parsers/svelte';
import { svgParser } from './parsers/svg';
import { svgFrameworkParser } from './parsers/svg-framework';
import { vueOfflineParser, vueParser } from './parsers/vue';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental
function assertNever(v: never) {
	//
}

// Re-export types
export { CodeOutput, ComponentCodeOutput };

/**
 * Output
 */
export const codeOutputComponentKeys: (keyof ComponentCodeOutput)[] = [
	'install-simple',
	'install-addon',
	'install-offline',
	'import-simple',
	'import-offline',
	'vue-simple',
	'vue-offline',
	// Usage
	'use-in-code',
	'use-in-template',
	'use-in-html',
	'use-generic',
];

/**
 * Get code for icon
 */
export function getIconCode(
	lang: CodeSampleMode,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
	let parser: CodeParser;

	switch (lang) {
		// SVG Framework
		case 'iconify':
			parser = svgFrameworkParser;
			break;

		// CSS
		case 'css':
			parser = cssParser;
			break;

		// React
		case 'react-api':
			parser = reactParser;
			break;

		case 'react-offline':
			parser = reactOfflineParser;
			break;

		// Vue
		case 'vue2-api':
			parser = vueParser.bind(null, false);
			break;

		case 'vue2-offline':
			parser = vueOfflineParser.bind(null, false);
			break;

		case 'vue3-api':
			parser = vueParser.bind(null, true);
			break;

		case 'vue3-offline':
			parser = vueOfflineParser.bind(null, true);
			break;

		// Svelte
		case 'svelte-api':
			parser = svelteParser;
			break;

		case 'svelte-offline':
			parser = svelteOfflineParser;
			break;

		// Ember
		case 'ember':
			parser = emberParser;
			break;

		// SVG
		case 'svg-box':
		case 'svg-raw':
		case 'svg-uri':
			parser = svgParser.bind(null, lang);
			break;

		default:
			assertNever(lang);
			return null;
	}

	return parser(icon, customisations, providerConfig);
}
