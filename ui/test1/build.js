const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

// List of commands to run
const commands = [];
const params = process.argv.slice(2);

// Check if required modules in same monorepo are available
const fileExists = (file) => {
	try {
		fs.statSync(file);
	} catch (e) {
		return false;
	}
	return true;
};

// Check if configurator requires compilation
if (!fileExists(packageDir('@iconify/search-configurator') + '/lib/index.js')) {
	commands.push({
		cmd: 'npm',
		args: ['run', 'build'],
		cwd: packageDir('@iconify/search-configurator'),
	});
}

// Add configure and build
commands.push({
	cmd: 'node',
	args: ['configure'].concat(params),
});

commands.push({
	cmd: 'npm',
	args: ['run', 'build:dist'],
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

/**
 * Get directory of a package
 */
function packageDir(package) {
	return path.dirname(require.resolve(package + '/package.json'));
}
