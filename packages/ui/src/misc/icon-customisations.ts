import { IconifyTransformations } from '@iconify/types';

/**
 * Icon customisation options
 */
export interface PartialIconCustomisations extends IconifyTransformations {
	// Color for color picker
	color?: string;
}

export type IconCustomisations = Required<PartialIconCustomisations>;

/**
 * Default icon customisations
 */
export function defaultIconCustomisations(): IconCustomisations {
	return {
		rotate: 0,
		hFlip: false,
		vFlip: false,
		color: '',
	};
}

export function customIconCustomisations(
	data: IconCustomisations
): PartialIconCustomisations {
	const defaultValues = defaultIconCustomisations();
	const result: PartialIconCustomisations = {};

	Object.keys(defaultValues).forEach(attr => {
		const key = attr as keyof PartialIconCustomisations;
		if (data[key] !== void 0 && data[key] !== defaultValues[key]) {
			(result as Record<string, unknown>)[key] = data[key];
		}
	});

	return result;
}
