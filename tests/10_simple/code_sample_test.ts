import 'mocha';
import { expect } from 'chai';
import { getIconCode } from '../../lib/code-samples/code';
import type {
	CodeSampleAPIConfig,
	CodeSampleMode,
} from '../../lib/code-samples/types';
import {
	mergeCustomisations,
	emptyCustomisations,
} from '../../lib/misc/customisations';
import { codeParser } from '../../lib/code-samples/code-parsers';
import { Iconify } from '../../lib/iconify';

const config: CodeSampleAPIConfig = {
	// Show packages that use API
	api: '',
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
};

describe('Testing code samples', () => {
	it('React without API', () => {
		const mode: CodeSampleMode = 'react-npm';
		const parser = codeParser(mode);

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} />',
			},
		});

		// String height, empty width
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					width: '',
					height: 'auto',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} height="auto" />',
			},
		});

		// Transformations
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					rotate: 1,
					hFlip: true,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} rotate={1} hFlip={true} />',
			},
		});

		// Inline icon with color
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					color: 'red',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} color="red" inline={true} />',
			},
		});
	});

	it('React with API', () => {
		const mode: CodeSampleMode = 'react-api';
		const parser = codeParser(mode);

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install1: `npm install --save-dev ${parser.npm?.install}`,
				import1: "import { Icon } from '@iconify/react';",
				use: '<Icon icon="mdi:home" />',
			},
		});

		// Inline icon with width as number
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					width: 24,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install1: `npm install --save-dev ${parser.npm?.install}`,
				import1: "import { Icon } from '@iconify/react';",
				use: '<Icon icon="mdi:home" width={24} inline={true} />',
			},
		});
	});

	it('Svelte without API', () => {
		const mode: CodeSampleMode = 'svelte';
		const parser = codeParser(mode);

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} />',
			},
		});

		// Inline icon with height and rotation
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					height: 24,
					rotate: 2,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<Icon icon={homeIcon} height={24} rotate={2} inline={true} />',
			},
		});

		// Inline icon with alignment, dimensions and color
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					color: 'purple',
					// Change 24x24 icon to 32x24 and align to right
					width: '32',
					height: '24',
					hAlign: 'right',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<Icon icon={homeIcon} color="purple" width="32" height="24" hAlign="right" inline={true} />',
			},
		});
	});

	it('Vue 2 without API', () => {
		const mode: CodeSampleMode = 'vue2';
		const parser = codeParser(mode);

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/vue';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});

		// Inline icon with size and alignment
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					// Change 24x24 icon to 24x32 and align to top
					width: '24',
					height: '32',
					vAlign: 'top',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/vue';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" width="24" height="32" verticalAlign="top" :inline="true" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});

		// Transformation and color
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					hFlip: true,
					color: 'green',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/vue';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" color="green" :horizontalFlip="true" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});
	});

	it('Vue 3 without API', () => {
		const mode: CodeSampleMode = 'vue3';
		const parser = codeParser(mode);

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify-icons/mdi`,
				import:
					"import { Icon } from '@iconify/vue';\n" +
					"import homeIcon from '@iconify-icons/mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});

		// Inline icon with size and alignment
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					// Change 24x24 icon to 32x24 and align to right
					width: '32',
					height: '24',
					hAlign: 'right',
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify-icons/mdi`,
				import:
					"import { Icon } from '@iconify/vue';\n" +
					"import homeIcon from '@iconify-icons/mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" width="32" height="24" horizontalAlign="right" :inline="true" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});

		// Color and transformation
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					color: '#f80',
					vFlip: true,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify-icons/mdi`,
				import:
					"import { Icon } from '@iconify/vue';\n" +
					"import homeIcon from '@iconify-icons/mdi/home';",
				use:
					'<template>\n\t<Icon :icon="icons.homeIcon" color="#f80" :verticalFlip="true" />\n</template>',
				vue:
					'export default {\n\tcomponents: {\n\t\tIcon,\n\t},\n\tdata() {\n\t\treturn {\n\t\t\ticons: {\n\t\t\t\thomeIcon,\n\t\t\t},\n\t\t};\n\t},\n});',
			},
		});
	});

	it('SVG framework', () => {
		const mode: CodeSampleMode = 'iconify';
		const parser = codeParser(mode);
		if (!Iconify.getVersion) {
			throw new Error('Missing Iconify.getVersion');
		}
		const version = Iconify.getVersion();
		const head = `<script src="https://code.iconify.design/2/${version}/iconify.min.js"></script>`;

		// Simple icon
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql({
			docs: parser.docs,
			iconify: {
				head,
				html: '<span class="iconify" data-icon="mdi:home"></span>',
			},
		});

		// Inline icon with transformations
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					inline: true,
					rotate: 1,
					hFlip: true,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			iconify: {
				head,
				html:
					'<span class="iconify-inline" data-icon="mdi:home" data-rotate="90deg" data-flip="horizontal"></span>',
			},
		});

		// Alignment, dimensions and color
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				mergeCustomisations(emptyCustomisations, {
					color: '#8f0',
					// Width is string, height is number (should both be converted to strings)
					width: '32',
					height: 24,
					// Align and slice
					hAlign: 'left',
					slice: true,
				}),
				config
			)
		).to.be.eql({
			docs: parser.docs,
			iconify: {
				head,
				html:
					'<span class="iconify" data-icon="mdi:home" style="color: #8f0;" data-width="32" data-height="24" data-align="left,slice"></span>',
			},
		});
	});

	it('SVG', () => {
		const mode: CodeSampleMode = 'svg-raw';
		// const parser = codeParser(mode);

		// Simple icon, for now returns null because icon data is not available
		// TODO: update code to support renderHTML()
		expect(
			getIconCode(
				mode,
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql(null);
	});
});
