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
 * Configuration
 */
export interface CodeConfig {
	// Config for providers
	providers: Record<string, ProviderCodeData>;

	// Default provider
	defaultProvider: ProviderCodeData;
}

/**
 * Configuration for providers
 */
export const codeConfig: CodeConfig = {
	providers: Object.create(null),
	defaultProvider: {
		iconify: true,
	},
};

// Add default provider
codeConfig.providers[''] = {
	iconify: true,
	npm: '@iconify-icons/{prefix}',
	file: '/{name}',
};
