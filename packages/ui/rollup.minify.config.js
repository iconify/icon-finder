import { terser } from 'rollup-plugin-terser';

const config = {
	input: 'dist/ui.js',
	output: {
		file: 'dist/ui.min.js',
		format: 'iife',
	},
	plugins: [terser()],
};

export default config;
