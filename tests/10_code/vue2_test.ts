import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { vueParser } from '../../lib/code-samples/parsers/vue';
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

describe('Testing Vue 2 with API code samples', () => {
	const docs: IconifyCodeDocs = {
		type: 'vue',
		href: docsBase + 'vue2/',
	};
	const installCode = `npm install --save-dev ${getComponentInstall('vue2')}`;
	const importCode = `import { Icon } from '${componentPackages.vue2.name}';`;
	const scriptCode =
		'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n});';

	it('Null', () => {
		expect(
			vueParser(
				false,
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
				'vue-simple': scriptCode,
			},
			isAPI: true,
		};
		expect(
			vueParser(
				false,
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
				'install-simple': installCode,
				'import-simple': importCode,
				'use-in-template':
					'<Icon icon="mdi:arrow-left" color="#f80" :height="24" :inline="true" />',
				'vue-simple': scriptCode,
			},
			isAPI: true,
		};
		expect(
			vueParser(
				false,
				{
					provider: '',
					prefix: 'mdi',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					color: '#f80',
					inline: true,
					height: 24,
				},
				config
			)
		).to.be.eql(expected);
	});

	it('Dimensions, transformations, alignment', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-simple': installCode,
				'import-simple': importCode,
				'use-in-template':
					'<Icon icon="@test-api:mdi:question-mark" width="auto" height="24" :rotate="3" :horizontalFlip="true" verticalAlign="bottom" :slice="true" />',
				'vue-simple': scriptCode,
			},
			isAPI: true,
		};
		expect(
			vueParser(
				false,
				{
					provider: 'test-api',
					prefix: 'mdi',
					name: 'question-mark',
				},
				{
					...emptyCustomisations,
					width: 'auto',
					height: '24',
					hFlip: true,
					rotate: 3,
					vAlign: 'bottom',
					slice: true,
				},
				config
			)
		).to.be.eql(expected);
	});
});
