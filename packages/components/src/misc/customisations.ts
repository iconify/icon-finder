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

	// Note: when adding new property, do not forget to add key/value pair below
}

export type PartialIconCustomisations = Partial<IconCustomisations>;

/**
 * Key/value pairs used in events
 */
type Transform<T extends keyof IconCustomisations> = {
	prop: T;
	value: IconCustomisations[T];
};
type HorizontalFlipCustomisation = Transform<'hFlip'>;
type VerticalFlipCustomisation = Transform<'vFlip'>;
type RotationCustomisation = Transform<'rotate'>;
type ColorCustomisation = Transform<'color'>;
type WidthCustomisation = Transform<'width'>;
type HeightCustomisation = Transform<'height'>;
type InlineCustomisation = Transform<'inline'>;

export type IconCustomisationPairs =
	| HorizontalFlipCustomisation
	| VerticalFlipCustomisation
	| RotationCustomisation
	| ColorCustomisation
	| WidthCustomisation
	| HeightCustomisation
	| InlineCustomisation;

/**
 * Default values
 */

// @iconify-replacement: 'defaultColor = '''
const defaultColor = '';

// @iconify-replacement: 'defaultWidth = '''
const defaultWidth = '';
// @iconify-replacement: 'defaultHeight = '''
const defaultHeight = '';

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
	color: defaultColor,
	width: defaultWidth,
	height: defaultHeight,
	inline: false,
};

/**
 * Add missing values to customisations, creating new object. Function does type checking
 */
export function mergeCustomisations(
	defaults: IconCustomisations,
	values: PartialIconCustomisations
): IconCustomisations {
	let result: Record<string, unknown> = {};
	for (let key in defaults) {
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
	let result: PartialIconCustomisations = {};
	for (let key in defaultCustomisations) {
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
