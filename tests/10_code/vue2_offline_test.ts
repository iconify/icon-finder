import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { vueOfflineParser } from '../../lib/code-samples/parsers/vue';
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

describe('Testing Vue 2 offline code samples', () => {
	const docs: IconifyCodeDocs = {
		type: 'vue',
		href: docsBase + 'vue2/',
	};
	const installCode = `npm install --save-dev ${getComponentInstall('vue2')}`;
	const importCode = `import { Icon } from '${componentPackages.vue2.name}';`;
	const scriptOfflineCode =
		'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\t{varName},\n\t\t\t},\n\t\t};\n\t},\n});';

	it('Null', () => {
		expect(
			vueOfflineParser(
				true,
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
				'use-in-template': '<Icon :icon="icons.homeIcon" />',
				'vue-offline': scriptOfflineCode.replace(
					'{varName}',
					'homeIcon'
				),
			},
			isAPI: false,
		};
		expect(
			vueOfflineParser(
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

	it('Color, dimensions, ES', () => {
		const expected: CodeOutput = {
			docs,
			component: {
				'install-offline': installCode + ' @iconify-icons/mdi-light',
				'import-offline':
					importCode +
					"\nimport arrowDown from '@iconify-icons/mdi-light/arrow-down';",
				'use-in-template':
					'<Icon :icon="icons.arrowDown" color="red" :width="24" height="24px" />',
				'vue-offline': scriptOfflineCode.replace(
					'{varName}',
					'arrowDown'
				),
			},
			isAPI: false,
		};
		expect(
			vueOfflineParser(
				false,
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-down',
				},
				{
					...emptyCustomisations,
					color: 'red',
					width: 24,
					height: '24px',
				},
				{ ...config, npmCJS: void 0 }
			)
		).to.be.eql(expected);
	});
});
