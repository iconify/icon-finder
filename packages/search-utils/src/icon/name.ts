import type { IconFinderIconName } from './types/name';

/**
 * Convert to icon name object
 */
export function getIconName(
	provider: string,
	prefix: string,
	name: string
): IconFinderIconName {
	const value = (provider ? '@' + provider + ':' : '') + prefix + ':' + name;
	return {
		provider,
		prefix,
		name,
		value,
	};
}
