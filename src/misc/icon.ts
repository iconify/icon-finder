import {
	IconifyIconName,
	stringToIcon as convert,
	validateIcon,
} from '@iconify/utils/lib/icon/name';

/**
 * Optional data used to categorise it
 */
interface IconArrays {
	// For categories
	tags?: string[];
	themePrefixes?: string[];
	themeSuffixes?: string[];

	// Extra icon information
	aliases?: string[];
	chars?: string[];
}

/**
 * Icon interface
 */
export interface Icon extends IconifyIconName, IconArrays {}

/**
 * Expression to test part of icon name.
 */
export const match = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Convert string to Icon object.
 */
export const stringToIcon = (
	value: string,
	validate = false,
	provider = ''
): Icon | null => {
	return convert(value, validate, false, provider);
};

/**
 * Check if icon is valid.
 */
export { validateIcon };

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
		icon1.provider === icon2.provider &&
		icon1.name === icon2.name &&
		icon1.prefix === icon2.prefix
	);
};

/**
 * Convert icon to string.
 */
export const iconToString = (icon: Icon): string => {
	return (
		(icon.provider === '' ? '' : '@' + icon.provider + ':') +
		icon.prefix +
		':' +
		icon.name
	);
};
