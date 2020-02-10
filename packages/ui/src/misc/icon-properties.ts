import { IconifyTransformations } from '@iconify/types';

/**
 * Icon properties
 */
export interface PartialIconProperties extends IconifyTransformations {
	// Color for color picker
	color?: string;

	// Dimensions
	width?: number | string;
	height?: number | string;
}

type ExtendType<T> = {
	[P in keyof T]: {
		defaultValue: T[P];
		emptyValue: T[P];
		[customProp: string]: unknown;
	};
};
export type ExtendedIconProperties = ExtendType<PartialIconProperties>;

// @iconify-replacement: 'ExtendedIconProperties = {}'
export const iconProps: ExtendedIconProperties = {};

/**
 * Compare items, get only modified values
 *
 * @param data
 */
export function exportCustomProperties(
	defaultValues: ExtendedIconProperties,
	values: PartialIconProperties
): PartialIconProperties {
	const result: PartialIconProperties = {};

	Object.keys(values).forEach(attr => {
		const key = attr as keyof PartialIconProperties;
		const item = defaultValues[key];
		if (item !== void 0) {
			const currentValue = values[key];
			if (
				currentValue !== item.defaultValue &&
				currentValue !== item.emptyValue
			) {
				(result as Record<string, unknown>)[key] = currentValue;
			}
		}
	});

	return result;
}
