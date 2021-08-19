import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { emberParser } from '../../lib/code-samples/parsers/ember';
import { docsBase } from '../../lib/code-samples/parsers/common';
import { getComponentInstall } from '../../lib/code-samples/versions';

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

describe('Testing Ember code samples', () => {
	const docs: IconifyCodeDocs = {
		type: 'ember',
		href: docsBase + 'ember/',
	};
	const installCode = `npm install --save-dev ${getComponentInstall(
		'ember'
	)}`;

	it('Null', () => {
		expect(
			emberParser(
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
			component: {
				'install-addon': installCode,
				'use-in-template': '<IconifyIcon @icon="mdi:home" />',
			},
			isAPI: true,
		};
		expect(
			emberParser(
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

	it('Color, inline, height', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-addon': installCode,
				'use-in-template':
					'<IconifyIcon @icon="mdi-light:arrow-left" @color="#f80" @height={{24}} @inline={{true}} />',
			},
			isAPI: true,
		};
		expect(
			emberParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					inline: true,
					height: 24,
					color: '#f80',
				},
				config
			)
		).to.be.eql(expected);
	});
});
