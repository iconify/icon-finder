/**
 * Representation of icon
 */
export interface Icon {
	readonly prefix: string;
	readonly name: string;
}

/**
 * Icon with optional data used to categorise it
 */
export interface ExtendedIconArrays {
	// For categories
	tags?: Array<string>;

	// Extra icon information
	aliases?: Array<string>;
	chars?: Array<string>;
}

export interface ExtendedIconStrings {
	// For categories
	themePrefix?: string;
	themeSuffix?: string;
}

export interface ExtendedIcon
	extends Icon,
		ExtendedIconArrays,
		ExtendedIconStrings {}

/**
 * Interface for extra parameters passed to extendIcon()
 */
interface ExtraIconStringParams {
	tag?: string;
	alias?: string;
	char?: string;
}

interface ExtraIconArrayParams {
	tags?: string[];
	aliases?: string[];
	chars?: string[];
}

interface ExtraIconStringOnlyParams {
	themePrefix?: string;
	themeSuffix?: string;
}

export interface ExtraIconParams
	extends ExtraIconStringParams,
		ExtraIconArrayParams,
		ExtraIconStringOnlyParams {}

/**
 * List of optional properties that could be referenced by both string or array and have multiple properties
 */
interface ExtraArraysItem {
	str: keyof ExtraIconStringParams;
	arr: keyof ExtraIconArrayParams;
	key: keyof ExtendedIconArrays;
}

const extraArrays: ExtraArraysItem[] = [
	{
		str: 'tag',
		arr: 'tags',
		key: 'tags',
	},
	{
		str: 'alias',
		arr: 'aliases',
		key: 'aliases',
	},
	{
		str: 'char',
		arr: 'chars',
		key: 'chars',
	},
];

/**
 * List of optional properties that are strings
 */
interface ExtraStringItem {
	str: keyof ExtraIconStringOnlyParams;
	key: keyof ExtendedIconStrings;
}

const extraStrings: ExtraStringItem[] = [
	{
		str: 'themePrefix',
		key: 'themePrefix',
	},
	{
		str: 'themeSuffix',
		key: 'themeSuffix',
	},
];

/**
 * List of properties that are arrays and should have unique values
 */
const uniqueArrays: (keyof ExtendedIconArrays)[] = ['tags', 'aliases', 'chars'];

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
 * Add extended properties to icon
 */
export const extendIcon = (
	source: Icon,
	params: Record<string, string | string[]>
): ExtendedIcon => {
	const icon = source as ExtendedIcon;

	// Add extra parameters that could be array and/or string
	extraArrays.forEach(attr => {
		const arrValue = params[attr.arr];
		let value: string[] = [];

		// Array
		if (typeof arrValue === 'string') {
			value = [arrValue];
		} else if (params[attr.arr] instanceof Array) {
			value = arrValue.slice(0);
		}

		// String alias
		const strValue = params[attr.str];
		if (typeof strValue === 'string') {
			value.push(strValue);
		}

		if (value.length > 0) {
			icon[attr.key] = value;
		}
	});

	// Add extra string parameters
	extraStrings.forEach(attr => {
		const value = params[attr.str];
		if (typeof value === 'string') {
			icon[attr.key] = value;
		}
	});

	// Check that array values are unique
	uniqueArrays.forEach(attr => {
		const item = icon[attr];
		if (item instanceof Array && item.length > 0) {
			icon[attr] = item.filter(
				(value, index, self) => self.indexOf(value) === index
			);
		}
	});

	return icon;
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
