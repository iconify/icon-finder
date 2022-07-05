import type { IconifyIconName } from '@iconify/utils';

/**
 * Convert icon name to string
 */
export function iconNameToString(
	icon: IconifyIconName,
	skipProvider = false
): string {
	return (
		(!skipProvider && icon.provider ? '@' + icon.provider + ':' : '') +
		icon.prefix +
		':' +
		icon.name
	);
}
