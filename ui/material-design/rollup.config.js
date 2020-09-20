import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

const production = !process.env.ROLLUP_WATCH;
const targetDir = 'demo/dist';

// Create target directory
try {
	mkdirSync(targetDir, 0o755);
} catch (err) {}

// Get current theme name from UI_THEME variable
const theme = process.env.UI_THEME;
console.log('Using theme:', theme);

// Copy stylesheets
const copy = {
	[`${theme}.css`]: require.resolve(
		`@iconify/search-themes/dist/${theme}.css`
	),
	'line-md.css': require.resolve('@iconify/search-themes/line-md.css'),
	'iconify.min.js': require.resolve(
		'@iconify/search-components/node_modules/@iconify/iconify/dist/iconify.min.js'
	),
};

Object.keys(copy).forEach((key) => {
	const themeData = readFileSync(copy[key], 'utf8');
	writeFileSync(`${targetDir}/${key}`, themeData, 'utf8');
	console.log(`Saved ${targetDir}/${key} (${themeData.length} bytes)`);
});

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
			file: `${targetDir}/${theme}.js`,
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
			json(),
			commonjs(),
		],
		watch: {
			clearScreen: false,
		},
	},
	{
		input: `${targetDir}/${theme}.js`,
		output: {
			sourcemap: false,
			format: 'iife',
			name: 'ui',
			file: `${targetDir}/${theme}.min.js`,
			globals: {
				'@iconify/iconify': 'Iconify',
			},
		},
		external: ['@iconify/iconify'],
		plugins: [terser()],
	},
];
