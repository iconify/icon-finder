import { lstatSync, readdirSync, writeFileSync } from 'fs';
import { BuildEntry, defineBuildConfig } from 'unbuild';
import packageJSON from './package.json';

const entries: BuildEntry[] = [];

const rootDir = './';
const sourceDir = 'src/';
const targetDir = 'lib/';

const packageExports = {
	'./*': './*',
};

function listFiles(dir: string) {
	const dirs = [];
	const files = [];

	// Find all files and directories, sort alphabetically
	const allFiles = readdirSync(rootDir + sourceDir + dir);
	allFiles.sort((a, b) => a.localeCompare(b));
	allFiles.forEach((file) => {
		const filename = dir + file;
		const stat = lstatSync(rootDir + sourceDir + filename);
		if (stat.isSymbolicLink()) {
			return;
		}
		if (stat.isDirectory()) {
			dirs.push(filename);
			return;
		}
		if (!stat.isFile()) {
			return;
		}

		const parts = file.split('.');
		const ext = parts.pop().toLowerCase();
		switch (ext) {
			case 'ts': {
				const name = dir + parts.join('.');
				if (parts.length > 1 && parts.pop() === 'd') {
					// .d.ts
					return;
				}
				files.push({
					input: sourceDir + name,
					name,
					key: './' + targetDir + name,
				});
				return;
			}

			default: {
				throw new Error(
					`Unsupported extension "${ext}" in ${filename}`
				);
			}
		}
	});

	// Directories first
	dirs.forEach((dir) => {
		listFiles(dir + '/');
	});

	// Files after directories
	files.forEach(({ key, input, name }) => {
		entries.push({
			input,
			name,
		});
		packageExports[key] = {
			types: key + '.d.ts',
			require: key + '.cjs',
			import: key + '.mjs',
		};
	});
}
listFiles('');

// Update exports in package.json
if (JSON.stringify(packageJSON.exports) !== JSON.stringify(packageExports)) {
	packageJSON.exports = packageExports as typeof packageJSON.exports;
	writeFileSync(
		rootDir + 'package.json',
		JSON.stringify(packageJSON, null, '\t') + '\n',
		'utf8'
	);
	console.log('package.json updated');
}

export default defineBuildConfig({
	outDir: './lib',
	entries,
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
});
