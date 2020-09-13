const { readFileSync } = require('fs');
const packageJSON = require('./package.json');
const { Replacements } = require('@cyberalien/conditional-replacements');
const {
	mkdir,
	unlink,
	listFiles,
	writeFile,
	readFile,
} = require('./config/fs');

const rootDir = __dirname;
const defaultSourceDir = rootDir + '/src';
const configuredDir = rootDir + '/src-configured';
const compiledDir = rootDir + '/lib';
const configFile = rootDir + '/' + packageJSON.configurator.config.current;

// Get configuration
const config = JSON.parse(readFileSync(configFile, 'utf8'));

// Get replacements
const replacements = new Replacements(
	config.replacements,
	'@iconify-replacement'
);

// Create target directories
mkdir(configuredDir);
mkdir(compiledDir);

// Get source directories
let sourceDirs = [defaultSourceDir];
if (config.customFiles) {
	sourceDirs.unshift(config.customFiles.path);
}

// Get all files from source directories
const sourceFiles = listFiles(sourceDirs);

// Remove all outdated files
listFiles(configuredDir).forEach((file) => {
	if (sourceFiles.indexOf(file) === -1) {
		unlink(configuredDir + '/' + file);
	}
});

listFiles(compiledDir).forEach((file) => {
	if (sourceFiles.indexOf(file) !== -1) {
		return;
	}

	// Check for .ts
	let test;
	if (file.slice(-5) === '.d.ts') {
		test = file.slice(0, file.length - 5) + '.ts';
	} else if (file.slice(-3) === '.js') {
		test = file.slice(0, file.length - 3) + '.ts';
	} else {
		unlink(compiledDir + '/' + file);
		return;
	}

	if (sourceFiles.indexOf(test) === -1) {
		unlink(compiledDir + '/' + file);
	}
});

// Copy all source files
let modified = 0,
	copied = 0;

sourceFiles.forEach((file) => {
	const ext = file.split('.').pop();
	switch (ext) {
		case 'js':
		case 'ts':
		case 'svelte':
			break;

		case 'json':
			return;

		default:
			console.error(
				`Unsupported file "${file}". Only JavaScript, TypeScript and Svelte files are allowed.`
			);
			process.exit(1);
	}

	const oldContent = readFile(sourceDirs, '/' + file);
	const newContent = replacements.parse(oldContent);

	// Write files to compile by TypeScript
	if (ext !== 'svelte') {
		writeFile(configuredDir + '/' + file, newContent);
	}

	// Write files that do not need TypeScript compilation
	if (ext !== 'ts') {
		writeFile(compiledDir + '/' + file, newContent);
	}

	if (oldContent === newContent) {
		modified++;
	} else {
		copied++;
	}
});

// Done
console.log(`Saved ${copied + modified} files (${modified} modified)`);
