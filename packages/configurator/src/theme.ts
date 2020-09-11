import { IconifyJSON } from '@iconify/types';

/**
 * Theme configuration
 */
export interface IconFinderThemeConfig {
	// Options for collections list
	collectionsList: {
		// True if icon link should be in HTML
		authorLink: boolean;

		// True if entire block is clickable
		clickable: boolean;
	};

	// True if search should be automatically focused
	focusSearch: boolean;

	// List of icons
	icons: {
		// Optional class name to add to all icons
		class?: string;

		// Icon names, use 'custom:' for custom icons
		names: Record<string, string>;

		// Custom icons data
		custom?: IconifyJSON | IconifyJSON[];
	};
}

/**
 * Combined config, including color rotation loaded from rotation.json
 */
export interface PreparedIconFinderThemeConfig extends IconFinderThemeConfig {
	rotation: number;
}

/**
 * Default values
 */
export const defaultThemeConfig: PreparedIconFinderThemeConfig = {
	collectionsList: {
		authorLink: false,
		clickable: false,
	},
	focusSearch: true,
	icons: {
		names: {},
	},
	rotation: 0,
};
