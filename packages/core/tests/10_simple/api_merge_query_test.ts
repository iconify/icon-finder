import 'mocha';
import { expect } from 'chai';
import { mergeQuery } from '../../lib/api/base';

describe('Testing mergeQuery', () => {
	it('mergeQuery()', () => {
		// Nothing
		expect(mergeQuery('/foo', {})).to.be.equal('/foo');

		// Simple variables
		expect(
			mergeQuery('/foo', {
				foo: 1,
				bar: 'baz',
				baz: true,
			})
		).to.be.equal('/foo?foo=1&bar=baz&baz=true');

		// Array
		expect(
			mergeQuery('/foo', {
				prefix: 'md',
				icons: ['home', 'arrow-left'],
			})
		).to.be.equal('/foo?prefix=md&icons=home,arrow-left');

		// More parameters to existing query
		expect(
			mergeQuery('/foo?bar=baz', {
				foo: false,
			})
		).to.be.equal('/foo?bar=baz&foo=false');

		// Escaping characters
		expect(
			mergeQuery('/foo', {
				'2&2': '1=1',
				'3 z': '?3',
			})
		).to.be.equal('/foo?2%262=1%3D1&3%20z=%3F3');
	});
});
