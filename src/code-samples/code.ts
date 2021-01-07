import type { IconifyIcon } from '@iconify/iconify';
import { Iconify } from '../iconify';
import type { IconCustomisations } from '../misc/customisations';
import type { Icon } from '../misc/icon';
import { iconToString } from '../misc/icon';
import type {
	IconifyCodeDocs,
	ParserAttr,
	TemplateCallback,
} from './code-parsers';
import { varName, codeParser } from './code-parsers';
import type { CodeSampleAPIConfig, CodeSampleMode } from './types';

// Iconify version (replaced during build!)
const iconifyVersion = '2.0.0';

/**
 * Output
 */
export interface CustomCodeOutput {
	key: string;
	code: string;
}

export interface IconifyCodeOutput {
	// Code to add to <head>
	head: string;

	// HTML code
	html: string;
}

export interface CustomCodeOutputWithText {
	// Text
	text?: string;

	// Code
	code?: string;
}

export interface ComponentCodeOutput {
	install?: string;
	import?: string;
	use: string;

	// Install / import without icon
	install1?: string;
	import1?: string;

	// Vue specific usage
	vue?: string;
}

export const codeOutputComponentKeys: (keyof ComponentCodeOutput)[] = [
	'install',
	'install1',
	'import',
	'import1',
	'vue',
	'use',
];

export interface CodeOutput {
	// Custom header and footer
	header?: CustomCodeOutputWithText;
	footer?: CustomCodeOutputWithText;

	// Iconify
	iconify?: IconifyCodeOutput;

	// Raw code to copy
	raw?: string[];

	// Component
	component?: ComponentCodeOutput;

	// Documentation
	docs?: IconifyCodeDocs;
}

/**
 * Convert template to string
 */
function resolveTemplate(
	value: string | TemplateCallback,
	attr: string,
	customisations: IconCustomisations
): string {
	return typeof value === 'string'
		? value.replace('{attr}', attr)
		: value(attr, customisations);
}

/**
 * Get code for icon
 */
export function getIconCode(
	lang: CodeSampleMode,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
	// Get parts for NPM code
	interface NPMImport {
		name: string;
		package: string;
		file: string;
	}
	function npmIconImport(preferES: boolean): NPMImport | null {
		const name = varName(icon.name);
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

		return {
			name,
			package: packageName,
			file,
		};
	}

	const parser = codeParser(lang);
	if (!parser) {
		return null;
	}

	// Icon as string
	const iconName = iconToString(icon);

	// Init parser
	const attr: ParserAttr = parser.init ? parser.init(customisations) : {};
	const attrParsers = parser.parsers;

	// Add icon name
	if (parser.iconParser) {
		parser.iconParser(attr, iconName, icon);
	}

	// Add color
	if (customisations.color !== '' && attrParsers.color) {
		attrParsers.color(attr, customisations.color);
	}

	// Add dimensions
	if (
		customisations.width === '' &&
		customisations.height !== '' &&
		attrParsers.onlyHeight
	) {
		attrParsers.onlyHeight(attr, customisations.height);
	} else {
		['width', 'height'].forEach((prop) => {
			const key = prop as keyof IconCustomisations;
			if (customisations[key] !== '' && attrParsers[key]) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				attrParsers[key]!(attr, customisations[key]);
			}
		});
	}

	// Transformations
	['rotate', 'vFlip', 'hFlip'].forEach((prop) => {
		const key = prop as keyof IconCustomisations;
		if (customisations[key] && attrParsers[key]) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			attrParsers[key]!(attr, customisations[key]);
		}
	});

	// Inline
	if (customisations.inline && attrParsers.inline) {
		attrParsers.inline(attr, true);
	}

	// Merge attributes
	const merged = parser.merge ? parser.merge(attr) : '';

	// Use template
	const html = parser.template
		? resolveTemplate(parser.template, merged, customisations)
		: '';

	// Generate output
	const output: CodeOutput = {
		docs: parser.docs,
	};

	// Add language specific stuff
	let str: string | null;
	let data: IconifyIcon | null;
	let npm: NPMImport | null;
	switch (lang) {
		case 'iconify':
			str = Iconify.getVersion ? Iconify.getVersion() : iconifyVersion;
			output.iconify = {
				head:
					'<script src="https://code.iconify.design/' +
					str.split('.').shift() +
					'/' +
					str +
					'/iconify.min.js"><' +
					'/script>',
				html,
			};
			return output;

		case 'svg-raw':
		case 'svg-box':
		case 'svg-uri':
			str = Iconify.renderHTML
				? Iconify.renderHTML(iconName, attr)
				: null;
			if (str === null) {
				return null;
			}
			if (customisations.color !== '') {
				str = str.replace(/currentColor/g, customisations.color);
			}
			if (lang === 'svg-box') {
				// Add empty rectangle before shapes
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				data = Iconify.getIcon ? Iconify.getIcon(iconName) : null;
				if (data) {
					str = str.replace(
						'>',
						'><rect x="' +
							data.left +
							'" y="' +
							data.top +
							'" width="' +
							data.width +
							'" height="' +
							data.height +
							'" fill="none" stroke="none" />'
					);
				} else {
					return null;
				}
			}
			if (lang === 'svg-uri') {
				// Remove unused attributes
				const parts = str.split('>');
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				let firstTag = parts.shift()!;
				['aria-hidden', 'focusable', 'role', 'class', 'style'].forEach(
					(attr) => {
						firstTag = firstTag.replace(
							new RegExp('\\s' + attr + '="[^"]*"'),
							''
						);
					}
				);
				parts.unshift(firstTag);
				str = parts.join('>');

				// Encode
				str =
					"url('data:image/svg+xml," + encodeURIComponent(str) + "')";
			}
			output.raw = [str];
			return output;

		case 'react-npm':
		case 'svelte':
		case 'vue2':
		case 'vue3':
			if (
				!parser.npm ||
				(!providerConfig.npmCJS && !providerConfig.npmES)
			) {
				return null;
			}
			npm = npmIconImport(lang === 'vue3');
			if (!npm) {
				return null;
			}
			output.component = {
				install:
					'npm install --save-dev ' +
					parser.npm.install +
					' ' +
					npm.package,
				import:
					resolveTemplate(parser.npm.import, merged, customisations) +
					'\nimport ' +
					npm.name +
					" from '" +
					npm.package +
					npm.file +
					"';",
				use: html
					.replace(/{varName}/g, npm.name)
					.replace('{iconPackage}', npm.package + npm.file),
			};
			if (typeof parser.vueTemplate === 'string') {
				output.component.vue = parser.vueTemplate
					.replace(/{varName}/g, npm.name)
					.replace('{iconPackage}', npm.package + npm.file);
			}
			return output;

		case 'react-api':
			if (!parser.npm) {
				return null;
			}
			output.component = {
				install1: 'npm install --save-dev ' + parser.npm.install,
				import1: resolveTemplate(
					parser.npm.import,
					merged,
					customisations
				),
				use: html,
			};
			return output;
	}
}
