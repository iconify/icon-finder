/**
 * Customisations
 */
export interface IconCustomisations {
	// Transformations
	hFlip: boolean;
	vFlip: boolean;
	rotate: number;

	// Color for color picker
	color: string;

	// Dimensions
	width: string;
	height: string;

	// Display mode
	inline: boolean;
}

export type PartialIconCustomisations = Partial<IconCustomisations>;

/**
 * Empty values
 */
export const emptyCustomisations: IconCustomisations = {
	hFlip: false,
	vFlip: false,
	rotate: 0,
	color: '',
	width: '',
	height: '',
	inline: false,
};

/**
 * Default values
 */
export const defaultCustomisations: IconCustomisations = {
	hFlip: false,
	vFlip: false,
	rotate: 0,
	color: '',
	width: '',
	height: '',
	inline: false,
};

/**
 * Add missing values to customisations, creating new object. Function does type checking
 */
export function mergeCustomisations(
	defaults: IconCustomisations,
	values: PartialIconCustomisations
): IconCustomisations {
	const result: Record<string, unknown> = {};
	for (const key in defaults) {
		const attr = key as keyof IconCustomisations;
		if (values && typeof values[attr] === typeof defaults[attr]) {
			result[attr] = values[attr];
		} else {
			result[attr] = defaults[attr];
		}
	}
	return (result as unknown) as IconCustomisations;
}

/**
 * Export only customised attributes
 */
export function filterCustomisations(
	values: IconCustomisations
): PartialIconCustomisations {
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
