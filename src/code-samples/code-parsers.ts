/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import type { IconCustomisations } from '../misc/customisations';
import type { Icon } from '../misc/icon';
import type { CodeSampleKey, CodeSampleMode } from './types';

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
const docsBase = 'https://docs.iconify.design/implementations/';

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
		// Import code
		import: string | TemplateCallback;
	};

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
	 * Get Vue parser
	 */
	function vueParser(vue3: boolean): Parser {
		const vue2Usage = '<template>\n\t<IconifyIcon {attr} />\n</template>';
		const vue2Template =
			'export default {\n\tcomponents: {\n\t\tIconifyIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';

		const parser: Parser = {
			iconParser: (list, valueStr, valueIcon) =>
				addVueAttr(list, 'icon', 'icons.' + varName(valueIcon.name)),
			parsers: {
				hFlip: (list, value) =>
					addVueAttr(list, 'horizontalFlip', value),
				vFlip: (list, value) => addVueAttr(list, 'verticalFlip', value),
			},
			merge: mergeAttributes,
			template: (attr, customisations) =>
				(vue3
					? vue2Usage.replace(
							/IconifyIcon/g,
							customisations.inline ? 'InlineIcon' : 'Icon'
					  )
					: vue2Usage
				).replace('{attr}', attr),
			vueTemplate: (attr, customisations) =>
				(vue3
					? vue2Template.replace(
							/IconifyIcon/g,
							customisations.inline ? 'InlineIcon' : 'Icon'
					  )
					: vue2Template
				).replace('{attr}', attr),
			docs: {
				type: 'vue',
				href: docsBase + (vue3 ? 'vue/' : 'vue2/'),
			},
			npm: vue3
				? {
						install: '@iconify/vue@beta',
						import: (attr, customisations) =>
							'import { ' +
							(customisations.inline ? 'InlineIcon' : 'Icon') +
							" } from '@iconify/vue';",
				  }
				: {
						install: '@iconify/vue@^1',
						import: "import IconifyIcon from '@iconify/vue';",
				  },
		};

		addMultipleAttributeParsers(
			parser,
			getCustomisationAttributes(true, false),
			addVueAttr
		);

		if (!vue3) {
			// Add inline attribute for vue2
			// Vue3 uses different component imports
			parser.parsers.inline = (list, value) =>
				addVueAttr(list, 'inline', value);
		}

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
				},
				merge: mergeAttributes,
				template: '<span {attr}></span>',
				docs: {
					type: 'iconify',
					href: docsBase + 'svg-framework/',
				},
			};

		// SVG
		case 'svg-raw':
		case 'svg-uri':
		case 'svg-box':
			parser = {
				parsers: {},
			};
			addMultipleAttributeParsers(
				parser,
				getCustomisationAttributes(false, true),
				addRawAttr
			);
			return parser;

		// React components
		case 'react-npm':
			parser = {
				iconParser: (list, valueStr, valueIcon) =>
					addReactAttr(list, 'icon', varName(valueIcon.name)),
				parsers: {},
				merge: mergeAttributes,
				template: (attr, customisations) =>
					'<' +
					(customisations.inline ? 'InlineIcon' : 'Icon') +
					' ' +
					attr +
					' />',
				docs: {
					type: 'react',
					href: docsBase + 'react/',
				},
				npm: {
					install: '@iconify/react@beta',
					import: (attr, customisations) =>
						'import { ' +
						(customisations.inline ? 'InlineIcon' : 'Icon') +
						" } from '@iconify/react';",
				},
			};
			addMultipleAttributeParsers(
				parser,
				getCustomisationAttributes(true, false),
				addReactAttr
			);
			return parser;

		case 'react-api':
			parser = {
				iconParser: (list, valueStr, valueIcon) =>
					addAttr(list, 'icon', valueStr),
				parsers: {},
				merge: mergeAttributes,
				template: (attr, customisations) =>
					'<' +
					(customisations.inline ? 'InlineIcon' : 'Icon') +
					' ' +
					attr +
					' />',
				docs: {
					type: 'react',
					href: docsBase + 'react-with-api/',
				},
				npm: {
					install: '@iconify/react-with-api',
					import: (attr, customisations) =>
						'import { ' +
						(customisations.inline ? 'InlineIcon' : 'Icon') +
						" } from '@iconify/react-with-api';",
				},
			};
			addMultipleAttributeParsers(
				parser,
				getCustomisationAttributes(true, false),
				addReactAttr
			);
			return parser;

		// Vue
		case 'vue2':
			return vueParser(false);

		case 'vue3':
			return vueParser(true);

		// Svelte
		case 'svelte':
			parser = {
				iconParser: (list, valueStr, valueIcon) =>
					addReactAttr(list, 'icon', varName(valueIcon.name)),
				parsers: {},
				merge: mergeAttributes,
				template: '<IconifyIcon {attr} />',
				docs: {
					type: 'svelte',
					href: docsBase + 'svelte/',
				},
				npm: {
					install: '@iconify/svelte',
					import: "import IconifyIcon from '@iconify/svelte';",
				},
			};
			addMultipleAttributeParsers(
				parser,
				getCustomisationAttributes(true, true),
				addReactAttr
			);

			return parser;
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
