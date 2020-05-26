import typescript from 'rollup-plugin-typescript2';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

/**
 * Export
 */
export default {
	input: 'src/index.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'ui',
		file: 'dist/ui.js',
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
