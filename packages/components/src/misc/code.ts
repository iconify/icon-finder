import { UITranslation } from '../phrases/types';

/**
 * Provider data
 */
export interface ProviderCodeData {
	// Use with Iconify SVG framework?
	iconify: boolean;

	// NPM package for single files: '@iconify-icons/{prefix}'
	npm?: string;

	// File for icon data, relative to package: '/{name}'
	file?: string;
}

/**
 * Config for displaying code samples
 */
export interface CodeLanguageConfig {
	show: boolean;
	expanded: boolean;
	title: string;
}

/**
 * Configuration
 */
export interface CodeConfig {
	// Config for providers
	providers: Record<string, ProviderCodeData>;

	// Default provider
	defaultProvider: ProviderCodeData;

	// Config for modules
	modules: Record<string, CodeLanguageConfig>;
}

/**
 * Default configuration
 */
export const defaultCodeConfig: CodeConfig = {
	providers: Object.create(null),
	defaultProvider: {
		iconify: true,
	},
	modules: Object.create(null),
};

// Add default provider
defaultCodeConfig.providers[''] = {
	iconify: true,
	npm: '@iconify-icons/{prefix}',
	file: '/{name}',
};

/**
 * Get title for code block
 */
export function getCodeTitle(phrases: UITranslation, key: string): string {
	const titles = phrases.code.titles;
	if (titles[key] !== void 0) {
		// Capitalize and store
		titles[key] = key.split('-').map(capitalize).join(' ');
	}

	return titles[key];
}

// Split numbers
const unitsSplit = /([0-9]+[0-9.]*)/g;

/**
 * Capitalize entry and split numbers
 */
function capitalize(str: string): string {
	return str
		.split(unitsSplit)
		.filter((item) => item.length > 0)
		.map((item) => item.slice(0, 1).toUpperCase() + item.slice(1))
		.join(' ');
}
