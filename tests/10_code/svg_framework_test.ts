import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { svgFrameworkParser } from '../../lib/code-samples/parsers/svg-framework';
import { docsBase } from '../../lib/code-samples/parsers/common';
import { iconifyVersion } from '../../lib/code-samples/versions';
import { Iconify } from '../../lib/iconify';

const config: CodeSampleAPIConfig = {
	// Show packages that use API
	api: true,
	// NPM packages for React, Vue, Svelte components
	npmES: {
		package: '@iconify-icons/{prefix}',
		file: '/{name}',
	},
	npmCJS: {
		package: '@iconify/icons-{prefix}',
		file: '/{name}',
	},
	// Allow generating SVG
	raw: true,
	// Remote SVG
	svg: 'https://api.iconify.design/{prefix}/{name}.svg',
};

describe('Testing SVG Framework code samples', () => {
	// Setup stuff
	const version = Iconify.getVersion ? Iconify.getVersion() : iconifyVersion;
	const head =
		'<script src="https://code.iconify.design/' +
		version.split('.').shift() +
		'/' +
		version +
		'/iconify.min.js"><' +
		'/script>';

	const docs: IconifyCodeDocs = {
		type: 'iconify',
		href: docsBase + 'svg-framework/',
	};

	it('Null', () => {
		expect(
			svgFrameworkParser(
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				{
					...config,
					api: false,
				}
			)
		).to.be.equal(null);
	});

	it('Simple code', () => {
		const expected: CodeOutput = {
			docs,
			iconify: {
				head,
				html: '<span class="iconify" data-icon="mdi:home"></span>',
			},
			isAPI: true,
		};
		expect(
			svgFrameworkParser(
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql(expected);
	});

	it('Inline icon with color and dimensions', () => {
		const expected: CodeOutput = {
			docs,
			iconify: {
				head,
				html:
					'<span class="iconify-inline" data-icon="@local-dev:mdi-light:test-icon" style="color: red;" data-width="24" data-height="32"></span>',
			},
			isAPI: true,
		};
		expect(
			svgFrameworkParser(
				{
					provider: 'local-dev',
					prefix: 'mdi-light',
					name: 'test-icon',
				},
				{
					...emptyCustomisations,
					inline: true,
					color: 'red',
					width: 24,
					height: 32,
				},
				config
			)
		).to.be.eql(expected);
	});

	it('Height, flip, alignment', () => {
		const expected: CodeOutput = {
			docs,
			iconify: {
				head,
				html:
					'<span class="iconify" data-icon="mdi-light:edit" style="font-size: 24px;" data-flip="horizontal" data-align="slice"></span>',
			},
			isAPI: true,
		};
		expect(
			svgFrameworkParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'edit',
				},
				{
					...emptyCustomisations,
					height: '24px',
					hFlip: true,
					slice: true,
				},
				config
			)
		).to.be.eql(expected);
	});

	it('Color, height as number, double flip', () => {
		const expected: CodeOutput = {
			docs,
			iconify: {
				head,
				html:
					'<span class="iconify" data-icon="mdi-light:question-mark" style="color: #f00; font-size: 24px;" data-flip="horizontal,vertical"></span>',
			},
			isAPI: true,
		};
		expect(
			svgFrameworkParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'question-mark',
				},
				{
					...emptyCustomisations,
					color: '#f00',
					height: 24,
					vFlip: true,
					hFlip: true,
				},
				config
			)
		).to.be.eql(expected);
	});

	it('Height as "auto", rotation, alignment', () => {
		const expected: CodeOutput = {
			docs,
			iconify: {
				head,
				html:
					'<span class="iconify" data-icon="mdi-light:arrow-left" data-height="auto" data-rotate="90deg" data-align="left,bottom,slice"></span>',
			},
			isAPI: true,
		};
		expect(
			svgFrameworkParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					height: 'auto',
					rotate: 1,
					hAlign: 'left',
					vAlign: 'bottom',
					slice: true,
				},
				config
			)
		).to.be.eql(expected);
	});
});
