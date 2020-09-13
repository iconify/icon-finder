import { ConfiguratorParams } from './params/type';
import { argsToParams } from './params/args';
import { parse, ParseResult } from './parse';

/**
 * Get parameters
 */
export function getParams(): ConfiguratorParams {
	return argsToParams(process.argv.slice(2), process.env);
}

/**
 * Build
 */
export function build(params: ConfiguratorParams): ParseResult {
	return parse(params);
}
