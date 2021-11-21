const fs = require('fs');
const child_process = require('child_process');

// List of commands to run
const commands = [];

// Parse command line
const compile = {
	lint: true,
	cleanup: true,
	lib: true,
	replace: false, //true,
};
process.argv.slice(2).forEach((cmd) => {
	if (cmd.slice(0, 2) !== '--') {
		return;
	}
	const parts = cmd.slice(2).split('-');
	if (parts.length === 2) {
		// Parse 2 part commands like --with-lib
		const key = parts.pop();
		if (compile[key] === void 0) {
			return;
		}
		switch (parts.shift()) {
			case 'with':
				// enable module
				compile[key] = true;
				break;

			case 'without':
				// disable module
				compile[key] = false;
				break;

			case 'only':
				// disable other modules
				Object.keys(compile).forEach((key2) => {
					compile[key2] = key2 === key;
				});
				break;
		}
	}
});

// Check if required modules in same monorepo are available
const fileExists = (file) => {
	try {
		fs.statSync(file);
	} catch (e) {
		return false;
	}
	return true;
};

/**
 * Replace version numbers
 */
const replace = () => {
	// Get version number
	const packageJSON = require.resolve('@iconify/iconify/package.json');
	if (!packageJSON) {
		throw new Error('Cannot locate SVG framework');
	}
	const data = JSON.parse(fs.readFileSync(packageJSON, 'utf8'));
	const version = data.version;

	// Find file
	const filename = __dirname + '/lib/code-samples/versions.js';
	if (!filename || !fileExists(filename)) {
		throw new Error('Cannot find code.js');
	}

	// Replace content
	const lines = fs.readFileSync(filename, 'utf8').split('\n');
	const search = "exports.iconifyVersion = '";
	const search2 = "'";
	let found = 0;
	lines.forEach((line, index) => {
		const start = line.indexOf(search);
		if (start === -1) {
			return;
		}
		const end = line.indexOf(search2, start + search.length);
		if (end === -1) {
			return;
		}

		lines[index] =
			line.slice(0, start + search.length) + version + line.slice(end);
		found++;
	});

	if (found !== 1) {
		throw new Error(
			`Expected to replace version number once, replaced ${found} times`
		);
	}

	fs.writeFileSync(filename, lines.join('\n'), 'utf8');
	console.log(`Replaced SVG framework version number with ${version}`);
};

/**
 * Generate commands
 */
Object.keys(compile).forEach((key) => {
	if (!compile[key]) {
		return;
	}
	switch (key) {
		case 'replace':
			commands.push(replace);
			break;

		default:
			commands.push({
				cmd: 'npm',
				args: ['run', key],
			});
	}
});

/**
 * Run next command
 */
const next = () => {
	const item = commands.shift();
	if (item === void 0) {
		process.exit(0);
	}

	if (typeof item === 'function') {
		// Run function
		item();
		process.nextTick(next);
		return;
	}

	// Execute
	if (item.cwd === void 0) {
		item.cwd = __dirname;
	}

	const result = child_process.spawnSync(item.cmd, item.args, {
		cwd: item.cwd,
		stdio: 'inherit',
	});

	if (result.status === 0) {
		process.nextTick(next);
	} else {
		process.exit(result.status);
	}
};
next();
