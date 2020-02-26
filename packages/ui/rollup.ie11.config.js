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
		buble({
			objectAssign: 'Object.assign',
		}),
		polyfill([__dirname + '/polyfills/object.assign.js']),
		terser(),
	],
};

export default config;
