import type {
	IconifyStorageFunctions,
	IconifyAPIFunctions,
	IconifyAPIInternalFunctions,
} from '@iconify/iconify';

/**
 * getVersion() function from SVG framework
 */
export type IconifyGetVersion = () => string;

/**
 * Mix of all functions
 */
export interface CoreIconifyFunctions
	// Pick only required functions
	extends Pick<IconifyStorageFunctions, 'getIcon' | 'addCollection'>,
		Pick<IconifyAPIInternalFunctions, 'getAPI'>,
		Pick<IconifyAPIFunctions, 'addAPIProvider'> {
	// Functions from SVG framework
	getVersion: IconifyGetVersion;
}

export const Iconify: Partial<CoreIconifyFunctions> = {};

/**
 * Set Iconify functions
 *
 * Use this to set Iconify module before doing anything
 */
export function setIconify(functions: Partial<CoreIconifyFunctions>): void {
	// Merge all functions
	[functions, (functions as Record<string, unknown>)._api].forEach(
		(items) => {
			if (typeof items === 'object') {
				for (const key in items) {
					const value = items[key as keyof typeof items];
					if (typeof value === 'function') {
						if (key === 'getVersion') {
							const version = (value as IconifyGetVersion)();
							if (version.slice(0, 4) === '2.0.') {
								// 2.1.0 is newer. To be fixed in rewrite
								continue;
							}
						}
						(Iconify as Record<string, unknown>)[key] = value;
					}
				}
			}
		}
	);
}
