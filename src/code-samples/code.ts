import { Iconify } from '../iconify';
import {
	emptyCustomisations,
	IconCustomisations,
} from '../misc/customisations';
import type { Icon } from '../misc/icon';
import { iconToString } from '../misc/icon';
import type {
	IconifyCodeDocs,
	ParserAttr,
	TemplateCallback,
} from './code-parsers';
import { varName, codeParser } from './code-parsers';
import { renderHTML } from './html';
import type {
	CodeSampleAPIConfig,
	CodeSampleMode,
	CodeSampleUsage,
} from './types';
import { iconifyVersion } from './versions';

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

type ComponentCodeUse = Record<CodeSampleUsage, string>;

export interface ComponentCodeOutput extends Partial<ComponentCodeUse> {
	// Install / import without icon
	'install-simple'?: string;
	'install-addon'?: string;
	'import-simple'?: string;

	// Install / import with icon
	'install-offline'?: string;
	'import-offline'?: string;

	// Vue specific usage
	'vue-simple'?: string;
	'vue-offline'?: string;
}

export const codeOutputComponentKeys: (keyof ComponentCodeOutput)[] = [
	'install-simple',
	'install-addon',
	'install-offline',
	'import-simple',
	'import-offline',
	'vue-simple',
	'vue-offline',
	// Usage
	'use-in-code',
	'use-in-template',
	'use-in-html',
	'use-generic',
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

	// True if code relies on API, false if offline
	isAPI?: boolean;
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
			const value = customisations[key];
			if (value !== null && value !== '' && attrParsers[key]) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				attrParsers[key]!(attr, value);
			}
		});
	}

	// Transformations and alignment
	['rotate', 'hFlip', 'vFlip', 'hAlign', 'vAlign', 'slice'].forEach(
		(prop) => {
			const key = prop as keyof IconCustomisations;
			const value = customisations[key];
			if (
				value !== void 0 &&
				value !== emptyCustomisations[key] &&
				attrParsers[key]
			) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				attrParsers[key]!(attr, value);
			}
		}
	);

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

	const useKey: keyof ComponentCodeOutput = parser.useType;

	// Add language specific stuff
	switch (lang) {
		case 'iconify': {
			const str = Iconify.getVersion
				? Iconify.getVersion()
				: iconifyVersion;
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
			output.isAPI = true;
			return output;
		}

		case 'svg-raw':
		case 'svg-box':
		case 'svg-uri': {
			const data = Iconify.getIcon?.(iconName);
			if (!data) {
				return null;
			}

			let str = renderHTML(data, customisations);
			if (lang === 'svg-box') {
				// Add empty rectangle before shapes
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
			output.isAPI = false;
			return output;
		}

		case 'react-offline':
		case 'svelte-offline':
		case 'vue2-offline':
		case 'vue3-offline': {
			if (
				!parser.npm ||
				(!providerConfig.npmCJS && !providerConfig.npmES)
			) {
				return null;
			}
			const npm = npmIconImport(
				// Use ES modules for Vue 3 and Svelte, CommonJS for everything else
				lang === 'vue3-offline' || lang === 'svelte-offline'
			);
			if (!npm) {
				return null;
			}
			output.component = {
				'install-offline':
					'npm install --save-dev ' +
					parser.npm.install +
					' ' +
					npm.package,
				'import-offline': parser.npm.import
					? resolveTemplate(
							parser.npm.import,
							merged,
							customisations
					  ) +
					  '\nimport ' +
					  npm.name +
					  " from '" +
					  npm.package +
					  npm.file +
					  "';"
					: void 0,
				[useKey]: html
					.replace(/{varName}/g, npm.name)
					.replace('{iconPackage}', npm.package + npm.file),
			};
			if (parser.vueTemplate !== void 0) {
				const html =
					typeof parser.vueTemplate === 'function'
						? resolveTemplate(
								parser.vueTemplate,
								merged,
								customisations
						  )
						: parser.vueTemplate;
				if (typeof html === 'string') {
					output.component['vue-offline'] = html
						.replace(/{varName}/g, npm.name)
						.replace('{iconPackage}', npm.package + npm.file);
				}
			}
			output.isAPI = false;
			return output;
		}

		case 'react-api':
		case 'svelte-api':
		case 'vue2-api':
		case 'vue3-api':
		case 'ember': {
			if (!parser.npm) {
				return null;
			}
			const parserNPM = parser.npm;

			const installKey = parserNPM.isAddon
				? 'install-addon'
				: 'install-simple';
			output.component = {
				[installKey]: 'npm install --save-dev ' + parserNPM.install,
				'import-simple': parserNPM.import
					? resolveTemplate(parserNPM.import, merged, customisations)
					: void 0,
				[useKey]: html,
			};

			if (parser.vueTemplate !== void 0) {
				const html =
					typeof parser.vueTemplate === 'function'
						? resolveTemplate(
								parser.vueTemplate,
								merged,
								customisations
						  )
						: parser.vueTemplate;
				if (typeof html === 'string') {
					output.component['vue-simple'] = html;
				}
			}
			output.isAPI = true;
			return output;
		}
	}
}
