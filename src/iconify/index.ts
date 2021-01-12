import type {
	IconifyStorageFunctions,
	IconifyAPIFunctions,
	IconifyAPIInternalFunctions,
	IconifyIconCustomisations,
	IconifyBuilderFunctions,
	IconifyIconBuildResult,
} from '@iconify/iconify';

/**
 * renderIcon() function from SVG framework
 */
export type IconifyRenderIcon = (
	name: string,
	customisations: IconifyIconCustomisations
) => IconifyIconBuildResult | null;

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
interface IconifyFunctions
	extends IconifyStorageFunctions,
		IconifyBuilderFunctions,
		IconifyAPIInternalFunctions,
		IconifyAPIFunctions {
	// Functions from SVG framework
	renderIcon: IconifyRenderIcon;
	renderHTML: IconifyRenderHTML;
	getVersion: IconifyGetVersion;

	// Custom function to generate placeholder, used for SSR when rendering SVG is not required
	renderPlaceholder: IconifyRenderHTML;
}

/**
 * Iconify functions
 *
 * Used functions:
 *  addCollection
 *  addAPIProvider
 *  getAPI (from _api)
 */
export const Iconify: Partial<IconifyFunctions> = {};

/**
 * Set Iconify functions
 *
 * Use this to set Iconify module before doing anything
 */
export function setIconify(functions: Partial<IconifyFunctions>): void {
	// Merge all functions, including _api
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
