/**
 * Copied from svg.js from @iconify/iconify package.
 *
 * TODO: replace function with Iconify exported function after publishing Iconify 2.0
 */

/**
 * Regular expressions for calculating dimensions
 *
 * @type {RegExp}
 */
const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;

/**
 * Calculate second dimension when only 1 dimension is set
 *
 * @param {string|number} size One dimension (such as width)
 * @param {number} ratio Width/height ratio.
 *      If size is width, ratio = height/width
 *      If size is height, ratio = width/height
 * @param {number} [precision] Floating number precision in result to minimize output. Default = 100
 * @return {string|number} Another dimension
 */
export function calculateDimension(
	size: number | string,
	ratio: number,
	precision = 100
): number | string {
	if (ratio === 1) {
		return size;
	}

	if (typeof size === 'number') {
		return Math.ceil(size * ratio * precision) / precision;
	}

	if (typeof size !== 'string') {
		return size;
	}

	// Split code into sets of strings and numbers
	let split = size.split(unitsSplit);
	if (split === null || !split.length) {
		return size;
	}

	const results = [];
	let code: string | undefined = split.shift() as string;
	let isNumber = unitsTest.test(code);

	while (true) {
		if (isNumber) {
			const num = parseFloat(code);
			if (isNaN(num)) {
				results.push(code);
			} else {
				results.push(Math.ceil(num * ratio * precision) / precision);
			}
		} else {
			results.push(code);
		}

		// next
		code = split.shift();
		if (code === void 0) {
			return results.join('');
		}
		isNumber = !isNumber;
	}
}

interface IconDimensions {
	width: number | string;
	height: number | string;
}

/**
 * Calculate both dimensions
 */
export function getDimensions(
	width: number | string,
	height: number | string,
	ratio: number,
	rotated: boolean
): IconDimensions {
	if (width && height) {
		return {
			width: rotated ? height : width,
			height: rotated ? width : height,
		};
	}

	if (!height) {
		height = calculateDimension(width, rotated ? ratio : 1 / ratio);
	} else {
		width = calculateDimension(height, rotated ? 1 / ratio : ratio);
	}
	return {
		width,
		height,
	};
}
