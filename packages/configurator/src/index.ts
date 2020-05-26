import { Params } from './params';
export { build } from './builder';
export { Params };

/**
 * Prepare params instance for building
 */
export function prepare(): Params {
	const params = new Params();
	params.applyEnv();
	params.applyArguments();
	params.buildConfig();
	params.validateTheme();
	params.checkModules();
	return params;
}
