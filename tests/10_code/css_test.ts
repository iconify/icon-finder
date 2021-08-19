import 'mocha';
import { expect } from 'chai';
import type { CodeSampleAPIConfig } from '../../lib/code-samples/types';
import { emptyCustomisations } from '../../lib/misc/customisations';
import type {
	CodeOutput,
	IconifyCodeDocs,
} from '../../lib/code-samples/parsers/types';
import { cssParser } from '../../lib/code-samples/parsers/css';
import { docsBase } from '../../lib/code-samples/parsers/common';

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

describe('Testing CSS code samples', () => {
	const docs: IconifyCodeDocs = {
		type: 'css',
		href: docsBase + 'css.html',
	};

	it('Null', () => {
		expect(
			cssParser(
				{
					provider: '',
					prefix: 'mdi',
					name: 'home',
				},
				emptyCustomisations,
				{
					...config,
					svg: void 0,
				}
			)
		).to.be.equal(null);
	});

	it('Simple code', () => {
		const expected: CodeOutput = {
			docs,
			raw: [
				"background: url('https://api.iconify.design/mdi-light/home.svg') no-repeat center center / contain;",
				"content: url('https://api.iconify.design/mdi-light/home.svg');",
			],
			isAPI: true,
		};
		expect(
			cssParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'home',
				},
				emptyCustomisations,
				config
			)
		).to.be.eql(expected);
	});

	it('Color, dimensions and transformation', () => {
		const expected: CodeOutput = {
			docs,
			raw: [
				"background: url('https://api.iconify.design/mdi-light/arrow-left.svg?color=%23f80&height=24&rotate=180deg&flip=horizontal%2Cvertical') no-repeat center center / contain;",
				"content: url('https://api.iconify.design/mdi-light/arrow-left.svg?color=%23f80&height=24&rotate=180deg&flip=horizontal%2Cvertical');",
			],
			isAPI: true,
		};
		expect(
			cssParser(
				{
					provider: '',
					prefix: 'mdi-light',
					name: 'arrow-left',
				},
				{
					...emptyCustomisations,
					height: 24,
					hFlip: true,
					vFlip: true,
					rotate: 2,
					color: '#f80',
				},
				config
			)
		).to.be.eql(expected);
	});
});
