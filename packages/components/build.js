const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const packagesDir = path.dirname(__dirname);
const getConfig = require('./build/config');

// List of commands to run
const commands = [];

// Parse command line
const compile = {
	core: false,
	theme: false,
	configure: true,
	lib: true,
};

process.argv.slice(2).forEach((cmd) => {
	// Commands
	if (cmd.slice(0, 2) !== '--') {
		return;
	}
	const command = cmd.slice(2);
	const parts = command.split('-');
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

// Always configure and build lib
compile.configure = true;
compile.lib = true;

// Get config
const config = getConfig(false);

// Check if theme has been compiled
if (
	!compile.theme &&
	!fileExists(packagesDir + '/themes/dist/' + config.theme + '.json')
) {
	compile.theme = true;
}

// Check if core has been compiled
if (!compile.core && !fileExists(packagesDir + '/core/lib/index.js')) {
	compile.core = true;
}

// Compile packages
Object.keys(compile).forEach((key) => {
	if (!compile[key]) {
		return;
	}
	switch (key) {
		case 'theme':
			commands.push({
				cmd: 'node',
				args:
					names.theme === ''
						? ['build']
						: ['build', '--theme', names.theme],
				cwd: packagesDir + '/themes',
			});
			return;

		case 'core':
			commands.push({
				cmd: 'npm',
				args: ['run', 'build'],
				cwd: packagesDir + '/' + key,
			});
			return;

		case 'configure':
			commands.push({
				cmd: 'node',
				args: ['configure'],
			});
			return;

		default:
			commands.push({
				cmd: 'npm',
				args: ['run', 'build:' + key],
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
