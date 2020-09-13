import { spawnSync } from 'child_process';
import { findPackage } from '../find-package';

/**
 * Rebuild core
 */
export function rebuildCore() {
	exec('core', findPackage('@iconify/search-core'), 'npm', ['run', 'build']);
}

/**
 * Execute build script
 */
export function exec(name: string, dir: string, cmd: string, args: string[]) {
	// Execute
	const result = spawnSync(cmd, args, {
		cwd: dir,
		stdio: 'inherit',
	});

	if (result.status !== 0) {
		throw new Error(`Error building ${name}`);
	}
}
