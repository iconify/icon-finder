import {
	emptyCustomisations,
	IconCustomisations,
} from '../../misc/customisations';
import type { Icon } from '../../misc/icon';
import type { CodeSampleAPIConfig } from '../types';

/**
 * Convert icon name to variable
 */
export function iconToVarName(iconName: string): string {
	let name = '';
	const parts = iconName.split('-');
	parts.forEach((part, index) => {
		name += index ? part.slice(0, 1).toUpperCase() + part.slice(1) : part;
	});
	if (name.charCodeAt(0) < 97 || name.charCodeAt(0) > 122) {
		// Not a-z - add "icon" at start
		name = 'icon' + name.slice(0, 1).toUpperCase() + name.slice(1);
	} else if (parts.length < 2) {
		// Add "Icon" to avoid reserved keywords
		name += 'Icon';
	}
	return name;
}

/**
 * Check if string contains units
 */
export function isNumber(value: unknown): boolean {
	return typeof value === 'number'
		? true
		: typeof value === 'string'
		? !!value.match(/^-?[0-9.]+$/)
		: false;
}

/**
 * Convert number to degrees string
 */
export function degrees(value: number): string {
	return value * 90 + 'deg';
}

/**
 * Convert value to string
 */
export function toString(value: unknown): string {
	switch (typeof value) {
		case 'number':
			return value + '';

		case 'string':
			return value;

		default:
			return JSON.stringify(value);
	}
}

/**
 * List of attributes
 */
const baseCustomisationAttributes: (keyof IconCustomisations)[] = [
	'width',
	'height',
	'rotate',
	'hFlip',
	'vFlip',
	'hAlign',
	'vAlign',
	'slice',
];

export function getCustomisationAttributes(
	color: boolean,
	inline: boolean
): (keyof IconCustomisations)[] {
	const results = baseCustomisationAttributes.slice(0);
	if (color) {
		results.push('color');
	}
	if (inline) {
		results.push('inline');
	}
	return results;
}

/**
 * Documentation
 */
export const docsBase = 'https://docs.iconify.design/icon-components/';

/**
 * Filter customisations
 */
export type CustomisationsList = Set<keyof IconCustomisations | 'onlyHeight'>;
export function getCustomisationsList(
	customisations: IconCustomisations
): CustomisationsList {
	const results: CustomisationsList = new Set();

	// Add color
	if (customisations.color !== '') {
		results.add('color');
	}

	// Add dimensions
	const width = customisations.width;
	const hasWidth = width !== null && width !== '';
	const height = customisations.height;
	const hasHeight = height !== null && height !== '';

	if (hasWidth) {
		results.add('width');
	}
	if (hasHeight) {
		results.add(hasWidth || height === 'auto' ? 'height' : 'onlyHeight');
	}

	// Transformations and alignment
	['rotate', 'hFlip', 'vFlip', 'hAlign', 'vAlign', 'slice'].forEach(
		(prop) => {
			const key = prop as keyof IconCustomisations;
			const value = customisations[key];
			if (value !== void 0 && value !== emptyCustomisations[key]) {
				results.add(key);
			}
		}
	);

	// Inline
	if (customisations.inline) {
		results.add('inline');
	}

	return results;
}

/**
 * Get NPM import instruction
 */
interface NPMImport {
	name: string;
	package: string;
	file: string;
	code: string;
}
export function npmIconImport(
	icon: Icon,
	name: string,
	providerConfig: CodeSampleAPIConfig,
	preferES: boolean
): NPMImport | null {
	const npm = preferES
		? providerConfig.npmES
			? providerConfig.npmES
			: providerConfig.npmCJS
		: providerConfig.npmCJS
		? providerConfig.npmCJS
		: providerConfig.npmES;
	if (!npm) {
		return null;
	}

	const packageName =
		typeof npm.package === 'string'
			? npm.package.replace('{prefix}', icon.prefix)
			: typeof npm.package === 'function'
			? npm.package(providerConfig, icon)
			: null;
	if (typeof packageName !== 'string') {
		return null;
	}

	const file =
		typeof npm.file === 'string'
			? npm.file.replace('{name}', icon.name)
			: typeof npm.file === 'function'
			? npm.file(providerConfig, icon)
			: null;
	if (typeof file !== 'string') {
		return null;
	}

	const code = 'import ' + name + " from '" + packageName + file + "';";

	return {
		name,
		package: packageName,
		file,
		code,
	};
}

/**
 * Attribute parsers
 */
// Storage for parsed attribute
interface ParsedAttributeObject {
	key: string;
	value: string;
	syntax?: string;
}

// Parsed value
type ParsedAttribute = string | ParsedAttributeObject;

// Attr
export type ParserAttr = Record<string, ParsedAttribute>;

export function addAttr(list: ParserAttr, key: string, value: string): void {
	list[key] = {
		key,
		value,
	};
}

export function addDynamicAttr(
	list: ParserAttr,
	key: string,
	anyValue: unknown,
	syntax?: string
): void {
	let value: string;
	switch (typeof anyValue) {
		case 'boolean':
			value = anyValue ? 'true' : 'false';
			break;

		case 'object':
			value = JSON.stringify(anyValue);
			break;

		default:
			value = anyValue as string;
	}

	list[key] = {
		key,
		value,
		syntax,
	};
}

export function addReactAttr(
	list: ParserAttr,
	key: string,
	value: unknown
): void {
	if (typeof value === 'string' && key !== 'icon') {
		addAttr(list, key, value);
	} else {
		addDynamicAttr(list, key, value, '{var}={{value}}');
	}
}

export function addVueAttr(
	list: ParserAttr,
	key: string,
	value: unknown
): void {
	if (typeof value === 'string' && key !== 'icon') {
		addAttr(list, key, value);
	} else {
		addDynamicAttr(list, key, value, ':{var}="{value}"');
	}
}

export function addEmberAttr(
	list: ParserAttr,
	key: string,
	value: unknown
): void {
	if (typeof value === 'string') {
		addAttr(list, '@' + key, value);
	} else {
		addDynamicAttr(list, key, value, '@{var}={{{value}}}');
	}
}

/**
 * Merge attribute values
 */
export function mergeAttr(
	list: ParserAttr,
	key: string,
	value: string,
	separator: string
): void {
	const oldItem: ParsedAttributeObject | undefined =
		typeof list[key] === 'object'
			? (list[key] as ParsedAttributeObject)
			: void 0;

	list[key] = {
		key,
		value: (oldItem ? oldItem.value + separator : '') + value,
		syntax: oldItem ? oldItem.syntax : void 0,
	};
}

/**
 * Merge result
 */
export function mergeAttributes(list: ParserAttr): string {
	return Object.keys(list)
		.map((key) => {
			const item = list[key];
			if (typeof item === 'object') {
				return (typeof item.syntax === 'string'
					? item.syntax
					: '{var}="{value}"'
				)
					.replace('{var}', item.key)
					.replace('{value}', item.value);
			}
			return item;
		})
		.join(' ');
}
