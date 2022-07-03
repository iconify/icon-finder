import type { IconifyAlias, IconifyJSON } from '@iconify/types';
import { overwriteValue } from './value';

interface IconProps {
	body: string;
	left: number;
	top: number;
	width: number;
	height: number;
}

const iconProps: (keyof IconProps)[] = [
	'body',
	'left',
	'top',
	'width',
	'height',
];

/**
 * Merge icon properties, only if missing
 */
export function reverseMergeIconProps(
	childProps: Partial<IconProps>,
	parentProps: Omit<IconifyAlias, 'parent'>
): Partial<IconProps> {
	const result = Object.assign({}, childProps);
	iconProps.forEach((prop) => {
		const value = parentProps[prop as 'width'];
		if (value !== void 0) {
			result[prop as 'width'] = value;
		}
	});
	return result;
}

/**
 * Merge properties with default values
 */
export function cleanupMergedIconProps(
	props: Partial<IconProps>,
	data: IconifyJSON
): IconProps {
	return {
		body: props.body || '',
		left: overwriteValue(0, props.left, data.left),
		top: overwriteValue(0, props.top, data.top),
		width: overwriteValue(16, props.width, data.width),
		height: overwriteValue(16, props.height, data.height),
	};
}
