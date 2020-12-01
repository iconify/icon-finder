import type { ColorKeywordValue } from './color-keywords';
import { baseColorKeywords, extendedColorKeywords } from './color-keywords';

export interface RGBColorValue {
	// RGB: 0-255
	r: number;
	g: number;
	b: number;
	// Alpha: 0-1
	a: number;
}

export interface HSLColorValue {
	// Hue: 0-360
	h: number;
	// Saturation 0-100
	s: number;
	// Lightness 0-100
	l: number;
	// Alpha: 0-1
	a: number;
}

/**
 * Attempt to convert color to keyword.
 *
 * Assumes that check for alpha === 1 has been completed
 */
function colorToKeyword(color: RGBColorValue): string | null {
	// Test all keyword lists
	const lists = [baseColorKeywords, extendedColorKeywords];
	for (let i = 0; i < lists.length; i++) {
		const list = lists[i];
		const keys = Object.keys(list);
		let key: string | undefined;
		while ((key = keys.shift()) !== void 0) {
			const rgb = list[key];
			if (
				rgb[0] === color.r &&
				rgb[1] === color.g &&
				rgb[2] === color.b
			) {
				return key;
			}
		}
	}

	return null;
}

/**
 * Convert array to object
 */
function valueToKeyword(value: ColorKeywordValue): RGBColorValue {
	return {
		r: value[0],
		g: value[1],
		b: value[2],
		a: 1,
	};
}

/**
 * Convert hex color to object
 */
function hexToColor(value: string): RGBColorValue | null {
	if (value.slice(0, 1) === '#') {
		value = value.slice(1);
	}
	if (!/^[\da-f]+$/i.test(value)) {
		return null;
	}

	let alphaStr = '';
	let redStr: string, greenStr: string, blueStr: string;
	let start = 0;
	switch (value.length) {
		case 4:
			alphaStr = value.slice(-1);
			alphaStr += alphaStr;

		// eslint-disable-next-line no-fallthrough
		case 3:
			redStr = value.slice(start, ++start);
			redStr += redStr;
			greenStr = value.slice(start, ++start);
			greenStr += greenStr;
			blueStr = value.slice(start, ++start);
			blueStr += blueStr;
			break;

		case 8:
			alphaStr = value.slice(-2);

		// eslint-disable-next-line no-fallthrough
		case 6:
			redStr = value.slice(start++, ++start);
			greenStr = value.slice(start++, ++start);
			blueStr = value.slice(start++, ++start);
			break;

		default:
			return null;
	}

	return {
		r: parseInt(redStr, 16),
		g: parseInt(greenStr, 16),
		b: parseInt(blueStr, 16),
		a: alphaStr === '' ? 1 : parseInt(alphaStr, 16) / 255,
	};
}

/**
 * Convert string to color
 */
export function stringToColor(
	value: string
): RGBColorValue | HSLColorValue | null {
	value = value.toLowerCase();

	// Test keywords
	if (baseColorKeywords[value] !== void 0) {
		return valueToKeyword(baseColorKeywords[value]);
	}
	if (extendedColorKeywords[value] !== void 0) {
		return valueToKeyword(extendedColorKeywords[value]);
	}

	// Test for function
	if (value.indexOf('(') === -1) {
		// Not a function: test hex string
		return hexToColor(value);
	}

	// Remove whitespace
	value = value.replace(/\s+/g, '');
	if (value.slice(-1) !== ')') {
		return null;
	}

	// Remove ')' at the end
	value = value.slice(0, value.length - 1);

	// Split by '('
	const parts = value.split('(');
	if (parts.length !== 2 || /[^\d.,%-]/.test(parts[1])) {
		return null;
	}

	const keyword = parts[0];
	const colors = parts[1].split(',');
	if (colors.length !== 3 && colors.length !== 4) {
		return null;
	}

	let alpha = 1;

	// Get alpha
	if (colors.length === 4) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const lastItem = colors.pop()!;
		alpha = parseFloat(lastItem) * (lastItem.slice(-1) === '%' ? 0.01 : 1);
		if (isNaN(alpha)) {
			return null;
		}
		alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
	}

	// Parse
	let color1: number; // red or hue
	let color2: number; // green or saturation
	let color3: number; // blue or lightness
	let isPercentages: boolean;
	let multiplier: number;
	switch (keyword) {
		case 'rgb':
		case 'rgba':
			// Either all or no components can be percentages
			isPercentages = colors[0].slice(-1) === '%';
			if (
				(colors[1].slice(-1) === '%') !== isPercentages ||
				(colors[2].slice(-1) === '%') !== isPercentages
			) {
				return null;
			}

			// Convert to numbers and normalize colors
			multiplier = isPercentages ? 2.55 : 1;
			color1 = parseFloat(colors[0]) * multiplier;
			color2 = parseFloat(colors[1]) * multiplier;
			color3 = parseFloat(colors[2]) * multiplier;

			return {
				r:
					isNaN(color1) || color1 < 0
						? 0
						: color1 > 255
						? 255
						: color1,
				g:
					isNaN(color2) || color2 < 0
						? 0
						: color2 > 255
						? 255
						: color2,
				b:
					isNaN(color3) || color3 < 0
						? 0
						: color3 > 255
						? 255
						: color3,
				a: alpha,
			};

		case 'hsl':
		case 'hsla':
			if (
				colors[0].indexOf('%') !== -1 ||
				colors[1].slice(-1) !== '%' ||
				colors[2].slice(-1) !== '%'
			) {
				// Hue cannot be percentage, saturation and lightness must be percentage
				return null;
			}

			// Convert to numbers and normalize colors
			color1 = parseFloat(colors[0]);
			color2 = parseFloat(colors[1]);
			color3 = parseFloat(colors[2]);

			return {
				h: isNaN(color1)
					? 0
					: color1 < 0
					? (color1 % 360) + 360
					: color1 >= 360
					? color1 % 360
					: color1,
				s:
					isNaN(color2) || color2 < 0
						? 0
						: color2 > 100
						? 100
						: color2,
				l:
					isNaN(color3) || color3 < 0
						? 0
						: color3 > 100
						? 100
						: color3,
				a: alpha,
			};
	}

	return null;
}

/**
 * Convert HSL to RGB
 */
function hslToRGB(value: HSLColorValue, round = false): RGBColorValue {
	function valore(n1: number, n2: number, hue: number): number {
		hue = hue < 0 ? (hue % 360) + 360 : hue >= 360 ? hue % 360 : hue;

		if (hue >= 240) {
			return n1;
		}
		if (hue < 60) {
			return n1 + ((n2 - n1) * hue) / 60;
		}
		if (hue < 180) {
			return n2;
		}
		return n1 + ((n2 - n1) * (240 - hue)) / 60;
	}

	const hue =
		value.h < 0
			? (value.h % 360) + 360
			: value.h >= 360
			? value.h % 360
			: value.h;
	const sat = value.s < 0 ? 0 : value.s > 100 ? 1 : value.s / 100;
	const lum = value.l < 0 ? 0 : value.l > 100 ? 1 : value.l / 100;

	let m2: number;
	if (lum <= 0.5) {
		m2 = lum * (1 + sat);
	} else {
		m2 = lum + sat * (1 - lum);
	}

	const m1 = 2 * lum - m2;

	let c1, c2, c3: number;
	if (sat === 0 && hue === 0) {
		c1 = lum;
		c2 = lum;
		c3 = lum;
	} else {
		c1 = valore(m1, m2, hue + 120);
		c2 = valore(m1, m2, hue);
		c3 = valore(m1, m2, hue - 120);
	}

	return {
		r: round ? Math.round(c1 * 255) : c1 * 255,
		g: round ? Math.round(c2 * 255) : c2 * 255,
		b: round ? Math.round(c3 * 255) : c3 * 255,
		a: value.a,
	};
}

/**
 * Convert color to string
 */
export function colorToString(color: RGBColorValue | HSLColorValue): string {
	// Attempt to convert to RGB
	let rgbColor: RGBColorValue;
	try {
		rgbColor =
			(color as RGBColorValue).r !== void 0
				? (color as RGBColorValue)
				: hslToRGB(color as HSLColorValue);
	} catch (err) {
		return '';
	}

	// Check precision
	const rgbRounded =
		rgbColor.r === Math.round(rgbColor.r) &&
		rgbColor.g === Math.round(rgbColor.g) &&
		rgbColor.b === Math.round(rgbColor.b);

	// Check for keyword and hexadecimal color
	if (rgbRounded && color.a === 1) {
		// Keyword?
		const keyword = colorToKeyword(rgbColor);
		if (typeof keyword === 'string') {
			return keyword;
		}

		// Hex color
		let result = '';
		let canShorten = true;
		try {
			(['r', 'g', 'b'] as (keyof RGBColorValue)[]).forEach((attr) => {
				const value = rgbColor[attr];
				if (value < 0 || value > 255) {
					throw new Error('Invalid color');
				}
				const str = (value < 16 ? '0' : '') + value.toString(16);
				result += str;
				canShorten = canShorten && str[0] === str[1];
			});
		} catch (err) {
			return '';
		}
		return '#' + (canShorten ? result[0] + result[2] + result[4] : result);
	}

	// RGB(A) or HSL(A)
	if (!rgbRounded && (color as HSLColorValue).h !== void 0) {
		// HSL(A)
		const hslColor = color as HSLColorValue;
		const list: string[] = [];
		try {
			// Hue
			let hue = hslColor.h % 360;
			while (hue < 0) {
				hue += 360;
			}
			list.push(hue + '');

			// Saturation, lightness
			(['s', 'l'] as (keyof HSLColorValue)[]).forEach((attr) => {
				const value = hslColor[attr];
				if (value < 0 || value > 100) {
					throw new Error('Invalid color');
				}
				list.push(value + '%');
			});
		} catch (err) {
			return '';
		}
		if (hslColor.a !== 1) {
			list.push(hslColor.a + '');
		}
		return (hslColor.a === 1 ? 'hsl(' : 'hsla(') + list.join(', ') + ')';
	}

	// RGB(A)
	const list: string[] = [];
	try {
		(['r', 'g', 'b'] as (keyof RGBColorValue)[]).forEach((attr) => {
			const value = rgbColor[attr];
			if (value < 0 || value > 255) {
				throw new Error('Invalid color');
			}
			list.push(value + '');
		});
	} catch (err) {
		return '';
	}
	if (rgbColor.a !== 1) {
		list.push(rgbColor.a + '');
	}
	return (rgbColor.a === 1 ? 'rgb(' : 'rgba(') + list.join(', ') + ')';
}
