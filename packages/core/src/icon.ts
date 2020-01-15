/**
 * Base icon
 */
interface BaseIcon {
	readonly prefix: string;
	readonly name: string;
}

/**
 * Optional data used to categorise it
 */
interface IconArrays {
	// For categories
	tags?: Array<string>;

	// Extra icon information
	aliases?: Array<string>;
	chars?: Array<string>;
}

interface IconStrings {
	// For categories
	themePrefix?: string;
	themeSuffix?: string;
}

/**
 * Icon interface
 */
export interface Icon extends BaseIcon, IconArrays, IconStrings {}

/**
 * Expression to test part of icon name.
 */
export const match = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Convert string to Icon object.
 */
export const stringToIcon = (value: string): Icon | null => {
	// Attempt to split by colon: "prefix:name"
	const colonSeparated = value.split(':');
	if (colonSeparated.length > 2) {
		return null;
	}
	if (colonSeparated.length === 2) {
		return {
			prefix: colonSeparated[0],
			name: colonSeparated[1],
		};
	}

	// Attempt to split by dash: "prefix-name"
	const dashSeparated = value.split('-');
	if (dashSeparated.length > 1) {
		return {
			// Array is not empty, so first shift() will always return string
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			prefix: dashSeparated.shift()!,
			name: dashSeparated.join('-'),
		};
	}

	return null;
};

/**
 * Check if icon is valid.
 *
 * This function is not part of stringToIcon because validation is not needed for most code.
 */
export const validateIcon = (icon: Icon | null): boolean => {
	if (!icon) {
		return false;
	}

	return !!(icon.prefix.match(match) && icon.name.match(match));
};

/**
 * Compare Icon objects.
 *
 * Note: null means icon is invalid, so null to null comparison = false.
 */
export const compareIcons = (
	icon1: Icon | null,
	icon2: Icon | null
): boolean => {
	return (
		icon1 !== null &&
		icon2 !== null &&
		icon1.name === icon2.name &&
		icon1.prefix === icon2.prefix
	);
};

/**
 * Convert icon to string.
 */
export const iconToString = (icon: Icon): string => {
	return icon.prefix + ':' + icon.name;
};
