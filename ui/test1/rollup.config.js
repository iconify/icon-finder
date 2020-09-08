import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

// Get current theme name
let theme;
try {
	const configuratorData = readFileSync(
		dirname(require.resolve('@iconify/search-components/package.json')) +
			'/lib/config.json',
		'utf8'
	);
	const configuratorConfig = JSON.parse(configuratorData);
	if (typeof configuratorConfig.theme !== 'string') {
		throw new Error('Invalid theme');
	}
	theme = configuratorConfig.theme;

	// Copy theme file
	const themeData = readFileSync(
		require.resolve(`@iconify/search-themes/dist/${theme}.css`, 'utf8')
	);
	writeFileSync(`dist/${theme}.css`, themeData, 'utf8');
	console.log(`Saved dist/${theme}.css (${themeData.length} bytes)`);
} catch (err) {
	throw new Error('Could not detect current theme. Run `node configure`');
}

/**
 * Export
 */
export default [
	{
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
	},
	/*
	{
		input: `dist/${theme}.js`,
		output: {
			sourcemap: false,
			format: 'iife',
			name: 'ui',
			file: `dist/${theme}.min.js`,
			globals: {
				'@iconify/iconify': 'Iconify',
			},
		},
		external: ['@iconify/iconify'],
		plugins: [terser()],
	},
	*/
];
