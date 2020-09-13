const mocha = require('mocha');
const { expect } = require('chai');
const { merge } = require('../lib/config/merge');

describe('Testing merging simple objects', () => {
	it('Non-object as parameter', (done) => {
		try {
			const merged = merge(true, {
				foo: 1,
			});
		} catch (err) {
			done();
			return;
		}

		done('Expected an exception');
	});

	it('Null as parameter', (done) => {
		try {
			const merged = merge(null, {
				foo: 1,
			});
		} catch (err) {
			done();
			return;
		}

		done('Expected an exception');
	});

	it('Array as parameter', (done) => {
		try {
			const merged = merge([1], {
				foo: 1,
			});
		} catch (err) {
			done();
			return;
		}

		done('Expected an exception');
	});

	it('Simple objects', () => {
		const item1 = {
			foo: 10,
			bar: 20,
		};
		const item2 = {
			baz: 30,
		};
		const merged = merge(item1, item2);

		// Check merged object
		expect(merged).to.be.eql({
			foo: 10,
			bar: 20,
			baz: 30,
		});

		// Make sure original objects weren't changed
		expect(item1).to.be.eql({
			foo: 10,
			bar: 20,
		});
		expect(item2).to.be.eql({
			baz: 30,
		});
	});

	it('Common keys', () => {
		const item1 = {
			foo: 10,
			bar: 20,
		};
		const item2 = {
			bar: 30,
			baz: 40,
		};
		const merged = merge(item1, item2);

		// Check merged object
		expect(merged).to.be.eql({
			foo: 10,
			bar: 30,
			baz: 40,
		});

		// Make sure original objects weren't changed
		expect(item1).to.be.eql({
			foo: 10,
			bar: 20,
		});
		expect(item2).to.be.eql({
			bar: 30,
			baz: 40,
		});
	});

	it('Nested objects', () => {
		const item1 = {
			foo: {
				key1: 'item1-foo-key1',
				key2: 'item1-foo-key2',
			},
			bar: {
				key1: 'item1-bar-key1',
			},
		};
		const item2 = {
			foo: {
				key1: 'item2-foo-key1',
				key3: 'item2-foo-key3',
			},
			baz: {
				key1: 'item2-baz-key1',
			},
		};
		const merged = merge(item1, item2);

		// Check merged object
		expect(merged).to.be.eql({
			foo: {
				key1: 'item2-foo-key1', // overwritten
				key2: 'item1-foo-key2',
				key3: 'item2-foo-key3',
			},
			bar: {
				key1: 'item1-bar-key1',
			},
			baz: {
				key1: 'item2-baz-key1',
			},
		});

		// Make sure original objects weren't changed
		expect(item1).to.be.eql({
			foo: {
				key1: 'item1-foo-key1',
				key2: 'item1-foo-key2',
			},
			bar: {
				key1: 'item1-bar-key1',
			},
		});
		expect(item2).to.be.eql({
			foo: {
				key1: 'item2-foo-key1',
				key3: 'item2-foo-key3',
			},
			baz: {
				key1: 'item2-baz-key1',
			},
		});
	});

	it('Arrays', (done) => {
		try {
			const merged = merge(
				{
					foo: [1, 2, 3],
				},
				{
					foo: {
						bar: 1,
					},
				}
			);
		} catch (err) {
			done();
			return;
		}

		done('Expected an exception');
	});
});
