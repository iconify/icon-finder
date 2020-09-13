import { IconifyJSON } from '@iconify/types';

/**
 * Data stored in package.json's "configurator" field
 */
export interface ThemePackageInfo {
	// True if multiple themes are supported
	multipleThemes?: boolean;

	//
	// If multipleThemes is enabled, variable {theme} is replaced with theme name in all fields below
	//

	// Command to build theme if it is missing
	build?: string;

	// Built stylesheet location
	stylesheet: string;

	// Built config location
	config: string;
}

// Custom icons
type CustomIcons = IconifyJSON | IconifyJSON[];

/**
 * Theme configuration
 */
export interface IconFinderThemeConfig {
	// List of icons
	icons: {
		// Optional class name to add to all icons
		class?: string;

		// Icon names
		names: Record<string, string>;

		// Custom icons data in Iconify JSON format.
		// For custom icons set provider to 'icon-finder' to avoid conflicts
		// and use '@icon-finder:prefix:name' syntax in names list.
		custom?: CustomIcons;
	};

	// Color rotation
	rotation: number;
}

/**
 * Default config
 */
export function config(): IconFinderThemeConfig {
	return {
		icons: {
			names: {},
		},
		rotation: 0,
	};
}

/**
 * Convert custom icons to array
 */
function customIconsToArray(data: CustomIcons): IconifyJSON[] {
	if (data instanceof Array) {
		return data;
	}
	return typeof data.icons === 'object' ? [data] : [];
}

/**
 * Extended function to get type: checks for null and array
 */
function getType(value: unknown): string {
	const result = typeof value;
	if (result !== 'object') {
		return result;
	}
	return value === null ? 'null' : value instanceof Array ? 'array' : result;
}

/**
 * Merge values from default config and custom config
 *
 * This function returns value only if values should be merged in a custom way, such as making sure some objects don't mix
 * Returns undefined if default merge method should be used.
 */
export function merge<T>(
	path: string,
	defaultValue: T,
	customValue: T
): T | void {
	function testType(type: string | string[]): void {
		const type1 = getType(defaultValue);
		const type2 = getType(customValue);
		const types = typeof type === 'string' ? [type] : type;

		if (types.indexOf(type1) === -1 || types.indexOf(type2) === -1) {
			throw new Error(
				`Expected ${types.join(
					' or '
				)} for ${path}, got ${type1} and ${type2}`
			);
		}
	}

	switch (path) {
		// Merge custom icons as arrays so both values are included in result
		case 'icons.custom':
			testType(['object', 'array']);
			const icons1 = customIconsToArray(
				(defaultValue as unknown) as CustomIcons
			);
			const icons2 = customIconsToArray(
				(customValue as unknown) as CustomIcons
			);

			return (icons2.concat(icons1) as unknown) as T;

		// Merge classes as arrays of strings so both values are included in result
		case 'icons.class':
			testType('string');
			const names1 = ((defaultValue as unknown) as string).split(/\s+/);
			const names2 = ((customValue as unknown) as string).split(/\s+/);

			// Remove empty and duplicate elements
			const names3 = names1
				.concat(names2)
				.filter(
					(item, index, list) =>
						item !== '' && list.indexOf(item) === index
				);
			return (names3.join(' ') as unknown) as T;
	}
}
