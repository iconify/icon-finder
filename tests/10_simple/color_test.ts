/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { RGBColorValue, HSLColorValue } from '../../lib/misc/colors';
import { stringToColor, colorToString } from '../../lib/misc/colors';

describe('Testing color conversions', () => {
	it('Keyword to object', () => {
		let result: RGBColorValue | HSLColorValue | null;
		let expected: RGBColorValue;

		// Simple color
		result = stringToColor('red');
		expected = {
			r: 255,
			g: 0,
			b: 0,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Mixed case
		result = stringToColor('Purple');
		expected = {
			r: 128,
			g: 0,
			b: 128,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Invalid values
		expect(stringToColor('currentColor')).to.be.equal(null);
		expect(stringToColor('inherit')).to.be.equal(null);
		expect(stringToColor('')).to.be.equal(null);
		expect(stringToColor('none')).to.be.equal(null);
		expect(stringToColor('redish')).to.be.equal(null);
	});

	it('Hex to object', () => {
		let result: RGBColorValue | HSLColorValue | null;
		let expected: RGBColorValue;

		// Simple color
		result = stringToColor('#00ff20');
		expected = {
			r: 0,
			g: 255,
			b: 32,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Mixed case
		result = stringToColor('#Ff82e4');
		expected = {
			r: 255,
			g: 130,
			b: 228,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Missing '#'
		result = stringToColor('02e4c1');
		expected = {
			r: 2,
			g: 228,
			b: 193,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Short version
		result = stringToColor('#82f');
		expected = {
			r: 136,
			g: 34,
			b: 255,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Short version without '#' and mixed case
		result = stringToColor('4Ea');
		expected = {
			r: 68,
			g: 238,
			b: 170,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// RRGGBBAA color
		result = stringToColor('#f1284e80');
		expected = {
			r: 241,
			g: 40,
			b: 78,
			a: 128 / 255,
		};
		expect(result).to.be.eql(expected);

		// RGBA without '#'
		result = stringToColor('1234');
		expected = {
			r: 17,
			g: 34,
			b: 51,
			a: 68 / 255,
		};
		expect(result).to.be.eql(expected);

		// Invalid colors
		result = stringToColor('#g12');
		expect(result).to.be.equal(null);

		result = stringToColor('#f1234');
		expect(result).to.be.equal(null);
	});

	it('RGB to object', () => {
		let result: RGBColorValue | HSLColorValue | null;
		let expected: RGBColorValue;

		// Simple color
		result = stringToColor('rgb(64, 128, 24)');
		expected = {
			r: 64,
			g: 128,
			b: 24,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Mixed case
		result = stringToColor('Rgb(25.5, 0, 100)');
		expected = {
			r: 25.5,
			g: 0,
			b: 100,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Alpha
		result = stringToColor('rgba(128, 50, 10, 0.2)');
		expected = {
			r: 128,
			g: 50,
			b: 10,
			a: 0.2,
		};
		expect(result).to.be.eql(expected);

		// Compact
		result = stringToColor('rgba(12,.5,3,.1)');
		expected = {
			r: 12,
			g: 0.5,
			b: 3,
			a: 0.1,
		};
		expect(result).to.be.eql(expected);

		// Percentages
		result = stringToColor('rgba(50%, 20%, 0.5%, 25%)');
		expected = {
			r: 2.55 * 50, // due to rounding in JavaScript, this ends up being 127.499999999..., so using same math in test as in code instead of hardcoding number
			g: 51,
			b: 1.275,
			a: 0.25,
		};
		expect(result).to.be.eql(expected);

		// RGBA without alpha, but allowed by CSS Colors Level 4
		result = stringToColor('rgba(128, 12, 34)');
		expected = {
			r: 128,
			g: 12,
			b: 34,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// RGB with alpha, but allowed by CSS Colors Level 4. Also using percentages only for alpha
		result = stringToColor('rgb(128, 12, 34, 50%)');
		expected = {
			r: 128,
			g: 12,
			b: 34,
			a: 0.5,
		};
		expect(result).to.be.eql(expected);

		// Overflow
		result = stringToColor('rgb(-100, 200, 300, -50%)');
		expected = {
			r: 0,
			g: 200,
			b: 255,
			a: 0,
		};
		expect(result).to.be.eql(expected);

		result = stringToColor('rgb(100, -200, 300, 2)');
		expected = {
			r: 100,
			g: 0,
			b: 255,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Invalid values
		result = stringToColor('rgb(10%, 20, 30)'); // All elements must have percentages
		expect(result).to.be.equal(null);
		result = stringToColor('rgb(10, 20, 30, 40, 50)'); // Too many values
		expect(result).to.be.equal(null);
		result = stringToColor('rgb(10, 20)'); // Too few values
		expect(result).to.be.equal(null);
	});

	it('HSL to object', () => {
		let result: RGBColorValue | HSLColorValue | null;
		let expected: HSLColorValue;

		// Simple color
		result = stringToColor('hsl(90, 50%, 30%)');
		expected = {
			h: 90,
			s: 50,
			l: 30,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// Mixed case
		result = stringToColor('HSLa(200, 10%, 20%, 60%)');
		expected = {
			h: 200,
			s: 10,
			l: 20,
			a: 0.6,
		};
		expect(result).to.be.eql(expected);

		// HSLA without alpha, but allowed by CSS Colors Level 4. Also testing hue overflow and double numbers.
		result = stringToColor('hsla(-90, 12.5%, 75.5%)');
		expected = {
			h: 270,
			s: 12.5,
			l: 75.5,
			a: 1,
		};
		expect(result).to.be.eql(expected);

		// HSL with alpha, but allowed by CSS Colors Level 4. Also testing overflow.
		result = stringToColor('hsl(500, -80%, 160%, .5)');
		expected = {
			h: 140,
			s: 0,
			l: 100,
			a: 0.5,
		};
		expect(result).to.be.eql(expected);

		// Hue cannot be percentage
		expect(stringToColor('hsl(10%, 20%, 30%)')).to.be.equal(null);

		// Saturation must be be percentage
		expect(stringToColor('hsl(10, 20, 30%)')).to.be.equal(null);

		// Lightness must be be percentage
		expect(stringToColor('hsl(10, 20%, 30)')).to.be.equal(null);

		// Too many values
		expect(stringToColor('hsla(10, 20, 30, 40, 50)')).to.be.equal(null);

		// Too few values
		expect(stringToColor('hsl(10, 20)')).to.be.equal(null);
	});

	it('RGB to string', () => {
		let color: RGBColorValue;

		// Color that can be converted to keyword
		color = {
			r: 255,
			g: 0,
			b: 0,
			a: 1,
		};
		expect(colorToString(color)).to.be.equal('red');

		// Keyword with alpha, so result should be rgba()
		color = {
			r: 255,
			g: 0,
			b: 0,
			a: 0.5,
		};
		expect(colorToString(color)).to.be.equal('rgba(255, 0, 0, 0.5)');

		// Hexadecimal
		color = {
			r: 10,
			g: 20,
			b: 30,
			a: 1,
		};
		expect(colorToString(color)).to.be.equal('#0a141e');

		// Cannot be hexadecimal because of not all colors can be rounded, so should be rgb()
		color = {
			r: 10.5,
			g: 20,
			b: 30,
			a: 1,
		};
		expect(colorToString(color)).to.be.equal('rgb(10.5, 20, 30)');

		// Cannot be hexadecimal because of alpha, so should be rgba()
		color = {
			r: 10,
			g: 20,
			b: 30,
			a: 0,
		};
		expect(colorToString(color)).to.be.equal('rgba(10, 20, 30, 0)');
	});

	it('HSL to string', () => {
		let color: HSLColorValue;

		// hsl()
		color = {
			h: 10,
			s: 20,
			l: 30,
			a: 1,
		};
		expect(colorToString(color)).to.be.equal('hsl(10, 20%, 30%)');

		// hsla()
		color = {
			h: 0,
			s: 55.5,
			l: 70,
			a: 0.5,
		};
		expect(colorToString(color)).to.be.equal('hsla(0, 55.5%, 70%, 0.5)');
	});
});
