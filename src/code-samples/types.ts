import type { Icon } from '../misc/icon';

/**
 * Code sample modes
 */
export type CodeSampleMode =
	// SVG framework
	| 'iconify'
	// Stylesheet
	| 'css'
	// Raw SVG
	| 'svg-raw'
	| 'svg-box'
	| 'svg-uri'
	// React
	| 'react-api'
	| 'react-offline'
	// Vue
	| 'vue2-api'
	| 'vue2-offline'
	| 'vue3-api'
	| 'vue3-offline'
	// Svelte
	| 'svelte-api'
	| 'svelte-offline'
	// Ember
	| 'ember';

// Tabs that combine multiple modes and do not generate code
export type CodeSampleTab = 'html' | 'react' | 'vue' | 'svelte' | 'svg';

// Combination of all modes + tabs
export type CodeSampleKey = CodeSampleMode | CodeSampleTab;

/**
 * Code sample type
 *
 * API mode for code that uses API
 * SVG mode is for remote SVG links
 * Offline mode for code that uses single icon NPM packages
 * Raw mode for tabs that generate result from icon data, such as raw SVG
 */
export type CodeSampleType = 'api' | 'svg' | 'offline' | 'raw';

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

interface CodeSampleNPMConfig {
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
}

export interface CodeSampleAPIConfig {
	// Iconify SVG framework API provider
	api?: string;

	// NPM package for single files that CommonJS exports.
	// Example: '@iconify-icons/{prefix}'
	npmCJS?: CodeSampleNPMConfig;

	// Same as above, but uses ES exports.
	// Only one of properties can be set: 'npm` or 'npmES', parsers will try preferred property first, then use other property as fallback.
	npmES?: CodeSampleNPMConfig;

	// Allow displaying raw SVG
	raw: boolean;

	// URL to remote SVG generator.
	// Example: 'https://api.iconify.design/{prefix}/{name}.svg'
	svg?: string;
}

/**
 * Titles for code sample tabs and modes
 */
type CodeSampleKeyOffline = CodeSampleKey | 'offline';
export type CodeSampleTitles = Partial<Record<CodeSampleKeyOffline, string>>;

/**
 * Usage
 */
export type CodeSampleUsage =
	| 'use-in-code'
	| 'use-in-template'
	| 'use-in-html'
	| 'use-generic';
