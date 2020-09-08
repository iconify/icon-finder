import { Params } from './params';
export { build } from './builder';
export { Params };

/**
 * Prepare params instance for building
 */
export function prepare(customFilesDir: string = ''): Params {
	const params = new Params();
	if (customFilesDir !== '') {
		console.log('Using custom files from', customFilesDir);
		params.applyArguments([
			'--config=' +
				JSON.stringify({
					customFilesDir,
				}),
		]);
	}
	params.applyEnv();
	params.applyArguments();
	params.buildConfig();
	params.validateTheme();
	params.checkModules();
	return params;
}
