import type { Icon } from '../misc/icon';

/**
 * Code sample modes
 */
export type CodeSampleMode =
	// SVG framework
	| 'iconify'
	// Raw SVG
	| 'svg-raw'
	| 'svg-box'
	| 'svg-uri'
	// React
	| 'react-npm'
	| 'react-api'
	// Vue
	| 'vue2'
	| 'vue3'
	// Svelte
	| 'svelte';

// Tabs that combine multiple modes and do not generate code
export type CodeSampleTab = 'react' | 'vue' | 'svg';

// Combination of all modes + tabs
export type CodeSampleKey = CodeSampleMode | CodeSampleTab;

/**
 * Code sample type
 *
 * API mode for code that uses API
 * NPM mode for code that uses single icon NPM packages
 * Raw mode for tabs that generate result from icon data, such as raw SVG
 */
export type CodeSampleType = 'api' | 'npm' | 'raw';

/**
 * API specific config for code samples
 */
export type CodeSampleAPIConfigNPMCallback = (
	config: CodeSampleAPIConfig,
	icon: Icon
) => string;
export type CodeSampleAPIConfigFileCallback = (
	config: CodeSampleAPIConfig,
	icon: Icon
) => string | null;

export interface CodeSampleAPIConfig {
	// Iconify SVG framework API provider
	api?: string;

	// NPM package for single files: '@iconify-icons/{prefix}'
	npm?: {
		// Package name: '@iconify-icons/{prefix}'
		// Variables:
		//  {prefix} = icon set prefix
		package: string | CodeSampleAPIConfigNPMCallback;

		// File for icon data, relative to package: '/{name}'
		// Variables:
		//  {prefix} = icon set prefix
		//  {name} = icon name
		// If missing or callback returns null, data should be imported from package
		file?: string | CodeSampleAPIConfigFileCallback;
	};

	// Allow displaying raw SVG
	raw: boolean;
}

/**
 * Titles for code sample tabs and modes
 */
export type CodeSampleTitles = Partial<Record<CodeSampleKey, string>>;
