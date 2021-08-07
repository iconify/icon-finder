/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import type { IconCustomisations } from '../misc/customisations';
import type { Icon } from '../misc/icon';
import type { CodeSampleKey, CodeSampleMode, CodeSampleUsage } from './types';
import { componentPackages, getComponentImport } from './versions';

/**
 * Convert icon name to variable
 */
export function varName(iconName: string): string {
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
function isNumber(value: unknown): boolean {
	return typeof value === 'number'
		? true
		: typeof value === 'string'
		? !!value.match(/^-?[0-9.]+$/)
		: false;
}

/**
 * Convert number to degrees string
 */
function degrees(value: number): string {
	return value * 90 + 'deg';
}

/**
 * Convert value to string
 */
function toString(value: unknown): string {
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
const docsBase = 'https://docs.iconify.design/icon-components/';

export interface IconifyCodeDocs {
	href: string;
	type: CodeSampleKey;
}

/**
 * Parser instance
 */
// Parser keys
type Attributes = keyof IconCustomisations;

// Callback for parser
type AttributeParser = (list: ParserAttr, value: unknown) => void;

// Storage for parsed attribute
interface ParsedAttributeObject {
	key: string;
	value: string;
	syntax?: string;
}

// Parsed value
type ParsedAttribute = string | ParsedAttributeObject;

// Keys for parser
type Parsers = Attributes | 'onlyHeight';

// Attr
export type ParserAttr = Record<string, ParsedAttribute>;

// Callback to get template
export type TemplateCallback = (
	attr: string,
	customisations: IconCustomisations
) => string;

// Parser
interface Parser {
	// Function to init parser
	init?: (customisations: IconCustomisations) => ParserAttr;

	// Function to merge data
	merge?: (list: ParserAttr) => string;

	// Template for code sample that uses {attr} variable for list of attributes
	template?: string | TemplateCallback;

	// Vue template
	vueTemplate?: string | TemplateCallback;

	// Parsers for attributes
	parsers: Partial<Record<Parsers, AttributeParser>>;

	// Special parser for icon name
	iconParser?: (list: ParserAttr, valueStr: string, valueIcon: Icon) => void;

	// NPM
	npm?: {
		// Package to install
		install: string;
		// True if package is addon, not component
		isAddon?: boolean;
		// Import code
		import?: string | TemplateCallback;
	};

	// Use type (different text)
	useType: CodeSampleUsage;

	// Documentation
	docs?: IconifyCodeDocs;
}

/**
 * Generate parsers
 */
function generateParser(mode: CodeSampleMode): Parser {
	/**
	 * Add attributes to parsed attributes
	 */
	function addRawAttr(list: ParserAttr, key: string, value: unknown) {
		list[key] = value as ParsedAttribute;
	}

	function addAttr(list: ParserAttr, key: string, value: string) {
		list[key] = {
			key,
			value,
		};
	}

	function addDynamicAttr(
		list: ParserAttr,
		key: string,
		anyValue: unknown,
		syntax?: string
	) {
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

	function addReactAttr(list: ParserAttr, key: string, value: unknown) {
		if (typeof value === 'string' && key !== 'icon') {
			addAttr(list, key, value);
		} else {
			addDynamicAttr(list, key, value, '{var}={{value}}');
		}
	}

	function addVueAttr(list: ParserAttr, key: string, value: unknown) {
		if (typeof value === 'string' && key !== 'icon') {
			addAttr(list, key, value);
		} else {
			addDynamicAttr(list, key, value, ':{var}="{value}"');
		}
	}

	function addEmberAttr(list: ParserAttr, key: string, value: unknown) {
		if (typeof value === 'string' && key !== 'icon') {
			addAttr(list, '@' + key, value);
		} else {
			addDynamicAttr(list, key, value, '@{var}={{value}}');
		}
	}

	/**
	 * Merge attribute values
	 */
	function mergeAttr(
		list: ParserAttr,
		key: string,
		value: string,
		separator: string
	) {
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
	 * Add functions for multiple attribute parsers
	 */
	function addMultipleAttributeParsers(
		parser: Parser,
		attribs: Attributes[],
		callback: (list: ParserAttr, key: string, value: unknown) => void
	) {
		attribs.forEach((attr) => {
			if (parser.parsers[attr] === void 0) {
				parser.parsers[attr] = (list: ParserAttr, value: unknown) =>
					callback(list, attr, value);
			}
		});
		return parser;
	}

	/**
	 * Merge result
	 */
	function mergeAttributes(list: ParserAttr): string {
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

	/**
	 * Get Vue offline parser
	 */
	function vueParser(offline: boolean, vue3: boolean): Parser {
		const templateCode = '<Icon {attr} />';
		const scriptOfflineCode =
			'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';
		const scriptOnlineCode =
			'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n});';

		const scriptCode = offline ? scriptOfflineCode : scriptOnlineCode;

		const parser: Parser = {
			iconParser: (list, valueStr, valueIcon) =>
				(offline ? addVueAttr : addAttr)(
					list,
					'icon',
					offline ? 'icons.' + varName(valueIcon.name) : valueStr
				),
			parsers: {
				hFlip: (list, value) =>
					addVueAttr(list, 'horizontalFlip', value),
				vFlip: (list, value) => addVueAttr(list, 'verticalFlip', value),
				hAlign: (list, value) =>
					addVueAttr(list, 'horizontalAlign', value),
				vAlign: (list, value) =>
					addVueAttr(list, 'verticalAlign', value),
				inline: (list, value) => addVueAttr(list, 'inline', value),
			},
			merge: mergeAttributes,
			template: (attr, customisations) =>
				templateCode.replace('{attr}', attr),
			vueTemplate: (attr, customisations) =>
				scriptCode.replace('{attr}', attr),
			docs: {
				type: 'vue',
				href: docsBase + (vue3 ? 'vue/' : 'vue2/'),
			},
			npm: {
				install: getComponentImport(vue3 ? 'vue3' : 'vue2'),
				import: (attr, customisations) =>
					"import { Icon } from '" +
					componentPackages[vue3 ? 'vue3' : 'vue2'].name +
					"';",
			},
			useType: 'use-in-template',
		};

		addMultipleAttributeParsers(
			parser,
			getCustomisationAttributes(true, false),
			addVueAttr
		);

		return parser;
	}

	function svelteParser(offline: boolean): Parser {
		const parser: Parser = {
			iconParser: (list, valueStr, valueIcon) =>
				(offline ? addReactAttr : addAttr)(
					list,
					'icon',
					offline ? varName(valueIcon.name) : valueStr
				),
			parsers: {},
			merge: mergeAttributes,
			template: '<Icon {attr} />',
			docs: {
				type: 'svelte',
				href: docsBase + 'svelte/',
			},
			npm: {
				install: getComponentImport('svelte'),
				import:
					"import Icon from '" + componentPackages.svelte.name + "';",
			},
			useType: 'use-in-template',
		};
		addMultipleAttributeParsers(
			parser,
			getCustomisationAttributes(true, true),
			addReactAttr
		);

		return parser;
	}

	function reactParser(offline: boolean): Parser {
		const parser: Parser = {
			iconParser: (list, valueStr, valueIcon) =>
				(offline ? addReactAttr : addAttr)(
					list,
					'icon',
					offline ? varName(valueIcon.name) : valueStr
				),
			parsers: {},
			merge: mergeAttributes,
			template: (attr, customisations) => '<Icon ' + attr + ' />',
			docs: {
				type: 'react',
				href: docsBase + 'react/',
			},
			npm: {
				install: getComponentImport('react'),
				import: (attr, customisations) =>
					"import { Icon } from '" +
					componentPackages.react.name +
					"';",
			},
			useType: 'use-in-template',
		};
		addMultipleAttributeParsers(
			parser,
			getCustomisationAttributes(true, true),
			addReactAttr
		);
		return parser;
	}

	function emberParser(): Parser {
		const parser: Parser = {
			iconParser: (list, valueStr, valueIcon) =>
				addAttr(list, 'icon', valueStr),
			parsers: {},
			merge: mergeAttributes,
			template: '<IconifyIcon {attr} />',
			docs: {
				type: 'ember',
				href: docsBase + 'ember/',
			},
			npm: {
				install: getComponentImport('ember'),
				isAddon: true,
			},
			useType: 'use-in-template',
		};
		addMultipleAttributeParsers(
			parser,
			getCustomisationAttributes(true, true),
			addEmberAttr
		);

		return parser;
	}

	/**
	 * Generate parser
	 */
	let parser: Parser;
	switch (mode) {
		case 'iconify':
			// SVG framework
			return {
				init: (customisations) => {
					return {
						class:
							'class="' +
							(customisations.inline
								? 'iconify-inline'
								: 'iconify') +
							'"',
					};
				},
				iconParser: (list, valueStr, valueIcon) =>
					addAttr(list, 'data-icon', valueStr),
				parsers: {
					color: (list, value) =>
						mergeAttr(list, 'style', 'color: ' + value + ';', ' '),
					onlyHeight: (list, value) =>
						mergeAttr(
							list,
							'style',
							'font-size: ' +
								value +
								(isNumber(value) ? 'px;' : ';'),
							' '
						),
					width: (list, value) =>
						addAttr(list, 'data-width', toString(value)),
					height: (list, value) =>
						addAttr(list, 'data-height', toString(value)),
					rotate: (list, value) =>
						addAttr(list, 'data-rotate', degrees(value as number)),
					hFlip: (list) =>
						mergeAttr(list, 'data-flip', 'horizontal', ','),
					vFlip: (list) =>
						mergeAttr(list, 'data-flip', 'vertical', ','),
					hAlign: (list, value) =>
						mergeAttr(list, 'data-align', value as string, ','),
					vAlign: (list, value) =>
						mergeAttr(list, 'data-align', value as string, ','),
					slice: (list) =>
						mergeAttr(list, 'data-align', 'slice', ','),
				},
				merge: mergeAttributes,
				template: '<span {attr}></span>',
				docs: {
					type: 'iconify',
					href: docsBase + 'svg-framework/',
				},
				useType: 'use-in-html',
			};

		// CSS
		case 'css':
			return {
				parsers: {
					color: (list, value) =>
						addAttr(list, 'color', toString(value)),
					width: (list, value) =>
						addAttr(list, 'width', toString(value)),
					height: (list, value) =>
						addAttr(list, 'height', toString(value)),
					rotate: (list, value) =>
						addAttr(list, 'rotate', degrees(value as number)),
					hFlip: (list) => mergeAttr(list, 'flip', 'horizontal', ','),
					vFlip: (list) => mergeAttr(list, 'flip', 'vertical', ','),
					hAlign: (list, value) =>
						mergeAttr(list, 'align', value as string, ','),
					vAlign: (list, value) =>
						mergeAttr(list, 'align', value as string, ','),
					slice: (list) => mergeAttr(list, 'align', 'slice', ','),
				},
				merge: (list: ParserAttr) => {
					return Object.keys(list)
						.map((key) => {
							const item = list[key];
							if (typeof item === 'object') {
								return (
									item.key +
									'=' +
									encodeURIComponent(item.value)
								);
							}
							return key + '=' + encodeURIComponent(item);
						})
						.join('&');
				},
				docs: {
					type: 'css',
					href: docsBase + 'css.html',
				},
				useType: 'use-in-html',
			};

		// SVG
		case 'svg-raw':
		case 'svg-uri':
		case 'svg-box':
			parser = {
				parsers: {},
				useType: 'use-generic',
			};
			addMultipleAttributeParsers(
				parser,
				getCustomisationAttributes(false, true),
				addRawAttr
			);
			return parser;

		// React components
		case 'react-offline':
			return reactParser(true);

		case 'react-api':
			return reactParser(false);

		// Vue
		case 'vue2-offline':
			return vueParser(true, false);

		case 'vue2-api':
			return vueParser(false, false);

		case 'vue3-offline':
			return vueParser(true, true);

		case 'vue3-api':
			return vueParser(false, true);

		// Svelte
		case 'svelte-offline':
			return svelteParser(true);

		case 'svelte-api':
			return svelteParser(false);

		// Ember
		case 'ember':
			return emberParser();
	}
}

/**
 * Parsers cache
 */
const cache: Record<CodeSampleMode, Parser> = Object.create(null);

/**
 * Get code parser
 */
export function codeParser(mode: CodeSampleMode): Parser {
	if (cache[mode] === void 0) {
		cache[mode] = generateParser(mode);
	}
	return cache[mode];
}
