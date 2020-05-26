import { writeFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { Params, RebuildModules } from './params';
import {
	packagesPath,
	componentsSourceConfigFile,
	componentsCompiledConfigFile,
} from './files';

// Build order
const buildOrder: (keyof RebuildModules)[] = ['core', 'theme', 'components'];

/**
 * TypeScript check to make sure all cases have been parsed
 */
function assertNever(value: never) {
	// Do nothing
}

/**
 * Build dependencies
 */
export function build(params: Params): Promise<Params> {
	return new Promise((fulfill, reject) => {
		if (params.config === void 0) {
			reject('Config has not been initialized and validated');
			return;
		}

		const keys = buildOrder.slice(0);

		function nextKey() {
			const key = keys.shift();
			if (key === void 0) {
				fulfill(params);
				return;
			}

			if (!params.rebuild[key]) {
				process.nextTick(nextKey);
				return;
			}

			// Get command to execute
			let dir, cmd, args;
			switch (key) {
				case 'core':
					dir = packagesPath + '/core';
					cmd = 'npm';
					args = ['run', 'build'];
					break;

				case 'theme':
					dir = packagesPath + '/themes';
					cmd = 'node';
					try {
						args = ['build', '--theme=' + params.validateTheme()];
					} catch (err) {
						reject(err.message);
						return;
					}
					break;

				case 'components':
					dir = packagesPath + '/components';
					cmd = 'node';
					try {
						args = ['build', '--theme=' + params.validateTheme()];
					} catch (err) {
						reject(err.message);
						return;
					}
					break;

				default:
					// If this throws TS error, do not forget to add new key to buildOrder array
					assertNever(key);
			}

			// Prepare
			switch (key) {
				case 'components':
					writeFileSync(
						componentsSourceConfigFile(),
						params.stringifyConfig(),
						'utf8'
					);
					break;
			}

			// Execute
			const result = spawnSync(cmd, args, {
				cwd: dir,
				stdio: 'inherit',
			});

			if (result.status !== 0) {
				reject('Error compiling ' + key);
				return;
			}

			// Run next command
			process.nextTick(nextKey);
		}

		nextKey();
	});
}
