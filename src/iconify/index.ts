import type {
	IconifyStorageFunctions,
	IconifyAPIFunctions,
	IconifyAPIInternalFunctions,
	IconifyIconCustomisations,
} from '@iconify/iconify';

/**
 * renderHTML function from SVG framework
 */
export type IconifyRenderHTML = (
	name: string,
	customisations: IconifyIconCustomisations
) => string | null;

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
	renderHTML: IconifyRenderHTML;
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
						(Iconify as Record<string, unknown>)[key] = value;
					}
				}
			}
		}
	);
}
