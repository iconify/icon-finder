import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { svelteParser } from '../../lib/code-samples/parsers/svelte';
import { docsBase } from '../../lib/code-samples/parsers/common';
import {
	componentPackages,
	getComponentInstall,
} from '../../lib/code-samples/versions';

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

describe('Testing Svelte with API code samples', () => {
	const docs: IconifyCodeDocs = {
		type: 'svelte',
		href: docsBase + 'svelte/',
	};
	const installCode = `npm install --save-dev ${getComponentInstall(
		'svelte'
	)}`;
	const importCode = `import Icon from '${componentPackages.svelte.name}';`;

	it('Null', () => {
		expect(
			svelteParser(
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
				'install-simple': installCode,
				'import-simple': importCode,
				'use-in-template': '<Icon icon="mdi:home" />',
			},
			isAPI: true,
		};
		expect(
			svelteParser(
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

	it('Color, inline, dimensions', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-simple': installCode,
				'import-simple': importCode,
				'use-in-template':
					'<Icon icon="@provider-test:mdi-light:home" color="#333" width="20px" height="30" inline={true} />',
			},
			isAPI: true,
		};
		expect(
			svelteParser(
				{
					provider: 'provider-test',
					prefix: 'mdi-light',
					name: 'home',
				},
				{
					...emptyCustomisations,
					color: '#333',
					inline: true,
					width: '20px',
					height: '30',
				},
				config
			)
		).to.be.eql(expected);
	});

	it('Height, transformations, alignment', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-simple': installCode,
				'import-simple': importCode,
				'use-in-template':
					'<Icon icon="mdi-light:arrow-left" height={24} rotate={2} vFlip={true} vAlign="top" />',
			},
			isAPI: true,
		};
		expect(
			svelteParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					height: 24,
					vFlip: true,
					rotate: 2,
					vAlign: 'top',
				},
				config
			)
		).to.be.eql(expected);
	});
});
