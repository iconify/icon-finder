const fs = require('fs');
const path = require('path');
const { Replacements } = require('@cyberalien/conditional-replacements');
const getConfig = require('./build/config');
const getReplacements = require('./build/replacements');
// const compile = require('./build/typescript');
const { mkdir, unlink, listFiles, writeFile } = require('./build/fs');

const rootDir = __dirname;
const sourceDir = rootDir + '/src';
const configuredDir = rootDir + '/src-configured';
const compiledDir = rootDir + '/lib';

// Get configuration
const config = getConfig();
const configCache = JSON.stringify(config);

// Get replacements
const replacementsList = getReplacements(config);
const replacements = new Replacements(replacementsList, '@iconify-replacement');

// Create target directories
mkdir(configuredDir);
mkdir(compiledDir);

// Get all files from source directory
const sourceFiles = listFiles(sourceDir);

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

		default:
			console.error(
				`Unsupported file "${file}". Only JavaScript, TypeScript and Svelte files are allowed.`
			);
			process.exit(1);
	}
	const oldContent = fs.readFileSync(sourceDir + '/' + file, 'utf8');
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

// Save config
writeFile(compiledDir + '/config.json', configCache, 'utf8');

console.log(`Saved ${copied + modified} files (${modified} modified)`);
