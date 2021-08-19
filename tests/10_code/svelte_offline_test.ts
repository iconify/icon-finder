import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { svelteOfflineParser } from '../../lib/code-samples/parsers/svelte';
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

describe('Testing Svelte offline code samples', () => {
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
			svelteOfflineParser(
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				{
					...config,
					npmES: void 0,
					npmCJS: void 0,
				}
			)
		).to.be.equal(null);
	});

	it('Simple code', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-offline': installCode + ' @iconify/icons-mdi',
				'import-offline':
					importCode +
					"\nimport homeIcon from '@iconify/icons-mdi/home';",
				'use-in-template': '<Icon icon={homeIcon} />',
			},
			isAPI: false,
		};
		expect(
			svelteOfflineParser(
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

	it('CommonJS only, color, transformations', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-offline': installCode + ' @iconify/icons-mdi-light',
				'import-offline':
					importCode +
					"\nimport arrowLeft from '@iconify/icons-mdi-light/arrow-left';",
				'use-in-template':
					'<Icon icon={arrowLeft} color="rgba(255, 0, 0, 0.5)" hFlip={true} />',
			},
			isAPI: false,
		};
		expect(
			svelteOfflineParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					color: 'rgba(255, 0, 0, 0.5)',
					hFlip: true,
					// Few properties to ignore
					width: '',
					rotate: 0,
					vFlip: false,
				},
				{ ...config, npmES: void 0 }
			)
		).to.be.eql(expected);
	});

	it('ES only, dimensions and alignment', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-offline': installCode + ' @iconify-icons/mdi',
				'import-offline':
					importCode +
					"\nimport homeOutline from '@iconify-icons/mdi/home-outline';",
				'use-in-template':
					'<Icon icon={homeOutline} height="1em" vAlign="bottom" slice={true} />',
			},
			isAPI: false,
		};
		expect(
			svelteOfflineParser(
				{
					provider: '',
					prefix: 'mdi',
					name: 'home-outline',
				},
				{
					...emptyCustomisations,
					height: '1em',
					hAlign: 'center', // default value
					vAlign: 'bottom',
					slice: true,
				},
				{ ...config, npmCJS: void 0 }
			)
		).to.be.eql(expected);
	});
});
