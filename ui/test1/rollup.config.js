import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

// Create 'dist'
try {
	mkdirSync('dist', 0o755);
} catch (err) {}

// Get current theme name
let theme;
try {
	// Get from UI_THEME variable
	theme = process.env.UI_THEME;
	console.log('Copying theme:', theme);

	// Copy theme file
	const themeData = readFileSync(
		require.resolve(`@iconify/search-themes/dist/${theme}.css`),
		'utf8'
	);
	writeFileSync(`dist/${theme}.css`, themeData, 'utf8');
	console.log(`Saved dist/${theme}.css (${themeData.length} bytes)`);
} catch (err) {
	console.error(err);
	throw new Error('Failed to copy current theme. Run `node build`');
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
