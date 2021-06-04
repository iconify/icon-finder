import 'mocha';
import { expect } from 'chai';
import { CodeOutput, getIconCode } from '../../lib/code-samples/code';
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
import { fullIcon, FullIconifyIcon } from '@iconify/utils/lib/icon';
import type { IconifyIconName } from '@iconify/utils/lib/icon/name';

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
		let expected: CodeOutput;

		// Simple icon
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// String height, empty width
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} height="auto" />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Transformations
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} rotate={1} hFlip={true} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Inline icon with color
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import { Icon } from '@iconify/react';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} color="red" inline={true} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);
	});

	it('React with API', () => {
		const mode: CodeSampleMode = 'react-api';
		const parser = codeParser(mode);
		let expected: CodeOutput;

		// Simple icon
		expected = {
			docs: parser.docs,
			component: {
				install1: `npm install --save-dev ${parser.npm?.install}`,
				import1: "import { Icon } from '@iconify/react';",
				use: '<Icon icon="mdi:home" />',
			},
			isAPI: true,
		};
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
		).to.be.eql(expected);

		// Inline icon with width as number
		expected = {
			docs: parser.docs,
			component: {
				install1: `npm install --save-dev ${parser.npm?.install}`,
				import1: "import { Icon } from '@iconify/react';",
				use: '<Icon icon="mdi:home" width={24} inline={true} />',
			},
			isAPI: true,
		};
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
		).to.be.eql(expected);
	});

	it('Svelte without API', () => {
		const mode: CodeSampleMode = 'svelte';
		const parser = codeParser(mode);
		let expected: CodeOutput;

		// Simple icon
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use: '<Icon icon={homeIcon} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Inline icon with height and rotation
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<Icon icon={homeIcon} height={24} rotate={2} inline={true} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Inline icon with alignment, dimensions and color
		expected = {
			docs: parser.docs,
			component: {
				install: `npm install --save-dev ${parser.npm?.install} @iconify/icons-mdi`,
				import:
					"import Icon from '@iconify/svelte';\n" +
					"import homeIcon from '@iconify/icons-mdi/home';",
				use:
					'<Icon icon={homeIcon} color="purple" width="32" height="24" hAlign="right" inline={true} />',
			},
			isAPI: false,
		};
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
		).to.be.eql(expected);
	});

	it('Vue 2 without API', () => {
		const mode: CodeSampleMode = 'vue2';
		const parser = codeParser(mode);
		let expected: CodeOutput;

		// Simple icon
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Inline icon with size and alignment
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Transformation and color
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);
	});

	it('Vue 3 without API', () => {
		const mode: CodeSampleMode = 'vue3';
		const parser = codeParser(mode);
		let expected: CodeOutput;

		// Simple icon
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Inline icon with size and alignment
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);

		// Color and transformation
		expected = {
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
			isAPI: false,
		};
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
		).to.be.eql(expected);
	});

	it('SVG framework', () => {
		const mode: CodeSampleMode = 'iconify';
		const parser = codeParser(mode);
		if (!Iconify.getVersion) {
			throw new Error('Missing Iconify.getVersion');
		}
		const version = Iconify.getVersion();
		const head = `<script src="https://code.iconify.design/2/${version}/iconify.min.js"></script>`;

		let expected: CodeOutput;

		// Simple icon
		expected = {
			docs: parser.docs,
			iconify: {
				head,
				html: '<span class="iconify" data-icon="mdi:home"></span>',
			},
			isAPI: true,
		};
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
		).to.be.eql(expected);

		// Inline icon with transformations
		expected = {
			docs: parser.docs,
			iconify: {
				head,
				html:
					'<span class="iconify-inline" data-icon="mdi:home" data-rotate="90deg" data-flip="horizontal"></span>',
			},
			isAPI: true,
		};
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
		).to.be.eql(expected);

		// Alignment, dimensions and color
		expected = {
			docs: parser.docs,
			iconify: {
				head,
				html:
					'<span class="iconify" data-icon="mdi:home" style="color: #8f0;" data-width="32" data-height="24" data-align="left,slice"></span>',
			},
			isAPI: true,
		};
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
		).to.be.eql(expected);
	});

	it('SVG', () => {
		const mode: CodeSampleMode = 'svg-raw';
		const parser = codeParser(mode);

		// Create dummy icon
		const icon: IconifyIconName = {
			provider: '',
			prefix: 'foo',
			name: 'svg-render-test',
		};
		const iconName = 'foo:svg-render-test';
		const iconData: FullIconifyIcon = fullIcon({
			body: '<g />',
		});

		// Replce getIcon()
		const getIcon = Iconify.getIcon;
		Iconify.getIcon = (name) => {
			if (name === iconName) {
				return iconData;
			}
			return getIcon ? getIcon(name) : null;
		};

		// Render icon
		const expected: CodeOutput = {
			docs: parser.docs,
			raw: [
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><g /></svg>',
			],
			isAPI: false,
		};
		expect(getIconCode(mode, icon, emptyCustomisations, config)).to.be.eql(
			expected
		);
	});
});
