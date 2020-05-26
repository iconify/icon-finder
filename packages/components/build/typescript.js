const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const rootDir = path.dirname(__dirname);

module.exports = (files, sourceDir, targetDir) => {
	function compile(fileNames, options) {
		// Create a Program with an in-memory emit
		const createdFiles = {};
		const host = ts.createCompilerHost(options);
		host.writeFile = (fileName, contents) =>
			(createdFiles[fileName] = contents);

		// Prepare and emit the d.ts files
		const program = ts.createProgram(fileNames, options, host);
		program.emit();

		// Loop through all the input files
		fileNames.forEach((file) => {
			console.log('### JavaScript\n');
			console.log(host.readFile(file));

			console.log('### Type Definition\n');
			const dts = file.replace('.js', '.d.ts');
			console.log(createdFiles[dts]);
		});
	}

	// Get config
	const config = JSON.parse(
		fs.readFileSync(rootDir + '/tsconfig.json', 'utf8')
	);

	const filenames = Object.keys(files);

	compile(
		filenames.map((file) => 'src/' + file),
		config.compilerOptions
	);
};
