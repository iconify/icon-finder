import { readFileSync } from 'fs';
import { dirname } from 'path';
import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

// Get current theme name
const packagesDir = dirname(__dirname);
let theme = 'iconify';
try {
	const configuratorData = readFileSync(
		packagesDir + '/components/lib/config.json',
		'utf8'
	);
	const configuratorConfig = JSON.parse(configuratorData);
	if (typeof configuratorConfig.theme !== 'string') {
		throw new Error('Invalid theme');
	}
	theme = configuratorConfig.theme;
} catch (err) {
	console.log(`Could not detect current theme, assuming "${theme}"`);
}

/**
 * Export
 */
export default {
	input: 'src/index.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'ui',
		file: `dist/${theme}.js`,
		globals: {
			'@iconify/iconify': 'Iconify',
		},
	},
	external: ['@iconify/iconify'],
	plugins: [
		resolve({
			browser: true,
			extensions: ['.ts', '.js', '.svelte'],
			dedupe: (importee) =>
				importee === 'svelte' || importee.startsWith('svelte/'),
		}),
		typescript(),
		svelte(),
		commonjs(),
	],
	watch: {
		clearScreen: false,
	},
};
