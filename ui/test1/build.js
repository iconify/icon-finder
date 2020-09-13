const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const commands = [];
// List of commands to run
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

// Configure
commands.push(configure);

// Build
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

	if (typeof item === 'function') {
		item();
		next();
		return;
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
 * Configure
 */
function configure() {
	const { getParams, build } = require('@iconify/search-configurator');

	// Parse command line
	const params = getParams();

	// Add configurator.json if config file was not specified
	if (!params.configFiles.length) {
		params.configFiles.push('configurator.json');
	}

	console.log(`Using config file: ${params.configFiles.join(', ')}`);

	// Build
	const result = build(params);
	console.log(
		result.rebuilt
			? 'Dependencies have been confgured and rebuilt.'
			: 'Done. Components do not require rebuilding.'
	);
	console.log(`Using theme: ${result.common.theme.name}`);

	// Set theme name to pass to Rollup
	process.env.UI_THEME = result.common.theme.name;
}

/**
 * Get directory of a package
 */
function packageDir(package) {
	return path.dirname(require.resolve(package + '/package.json'));
}
