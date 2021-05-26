import {
	IconifyIconCustomisations,
	defaults,
	mergeCustomisations as merge,
} from '@iconify/utils/lib/customisations';

/**
 * Customisations
 */
interface CoreIconCustomisations {
	// Color for color picker
	color: string;
}

export interface IconCustomisations
	extends Required<IconifyIconCustomisations>,
		CoreIconCustomisations {}

export type PartialIconCustomisations = Partial<IconCustomisations>;

/**
 * Custom values
 */
const emptyCustomValues: CoreIconCustomisations = {
	color: '',
};

/**
 * Empty values
 */
export const emptyCustomisations: IconCustomisations = {
	...defaults,
	...emptyCustomValues,
};

/**
 * Default values
 */
export const defaultCustomisations: IconCustomisations = {
	...emptyCustomisations,
};

/**
 * Add missing values to customisations, creating new object. Function does type checking
 */
export function mergeCustomisations(
	defaults: IconCustomisations,
	values: PartialIconCustomisations
): IconCustomisations {
	// Merge default properties
	const result = merge(defaults, values);

	// Merge custom properties
	for (const key in emptyCustomValues) {
		const attr = key as keyof CoreIconCustomisations;

		// Match type
		(result as Record<string, unknown>)[attr] =
			values && typeof values[attr] === typeof defaults[attr]
				? values[attr]
				: defaults[attr];
	}

	return (result as unknown) as IconCustomisations;
}

/**
 * Export only customised attributes
 */
export function filterCustomisations(
	values: IconCustomisations
): PartialIconCustomisations {
	// Function can handle any properties, just needs some type hinting
	const result: PartialIconCustomisations = {};
	for (const key in defaultCustomisations) {
		const attr = key as keyof IconCustomisations;
		if (
			values[attr] !== defaultCustomisations[attr] &&
			values[attr] !== emptyCustomisations[attr]
		) {
			(result as Record<string, unknown>)[attr] = values[attr];
		}
	}
	return result;
}
