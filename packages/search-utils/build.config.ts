import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { BuildEntry, defineBuildConfig } from 'unbuild';

const entries: BuildEntry[] = [];

const rootDir = './';
const sourceDir = 'src/';
const targetDir = 'lib/';

interface PackageExportsItem {
	types: string;
	require: string;
	import: string;
}
const packageExports = {
	'./*': './*',
} as Record<string, string | PackageExportsItem>;

function listFiles(dir: string) {
	interface FilesListEntry {
		input: string;
		name: string;
		src: string;
		target: string;
	}

	const dirs: string[] = [];
	const files: FilesListEntry[] = [];

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
		const ext = (parts.pop() as string).toLowerCase();
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
					src: './' + sourceDir + filename,
					target: './' + targetDir + name,
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
	files.forEach(({ target, input, name }) => {
		entries.push({
			input,
			name,
		});
		packageExports[target] = {
			types: target + '.d.ts',
			require: target + '.cjs',
			import: target + '.mjs',
		};
	});
}
listFiles('');

// Update exports in package.json
const packageJSON = JSON.parse(
	readFileSync('./package.json', 'utf8')
) as Record<string, typeof packageExports>;

if (JSON.stringify(packageJSON.exports) !== JSON.stringify(packageExports)) {
	packageJSON.exports = packageExports;
	writeFileSync(
		rootDir + 'package.json',
		JSON.stringify(packageJSON, null, '\t') + '\n',
		'utf8'
	);
	console.log('package.json updated');
}

// Export config
export default defineBuildConfig({
	outDir: './lib',
	entries,
	clean: true,
	declaration: true,
	rollup: {
		emitCJS: true,
	},
});
