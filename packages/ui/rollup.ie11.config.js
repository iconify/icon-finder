import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import polyfill from 'rollup-plugin-polyfill';
import buble from '@rollup/plugin-buble';
import { terser } from 'rollup-plugin-terser';

const config = {
	input: 'dist/ui.js',
	output: {
		file: 'dist/ui.ie11.js',
		format: 'iife',
	},
	plugins: [
		resolve({
			browser: true,
			extensions: ['.js'],
		}),
		commonjs(),
		buble({
			objectAssign: 'Object.assign',
		}),
		polyfill([
			'core-js/features/promise',
			'core-js/features/object/assign',
			'core-js/features/object/entries',
			// 'core-js/features/array/fill',
			// 'core-js/features/array/find',
			// 'core-js/features/array/from',
			'core-js/es/array',
		]),
		// terser(),
	],
};

export default config;
