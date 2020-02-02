const child_process = require('child_process');
const cmd = getCommand();

child_process.spawn('npx', cmd, {
	cwd: __dirname,
	detached: false,
	stdio: 'inherit',
});

/**
 * Get parameters to execute
 */
function getCommand() {
	return [
		'nodemon',
		// Extensions to watch
		'--ext',
		'scss,css,json',
		// Delay
		'--delay',
		'250ms',
		// Command to run
		'--exec',
		'npm',
		'run',
		'build',
	].concat(process.argv.slice(2));
}
