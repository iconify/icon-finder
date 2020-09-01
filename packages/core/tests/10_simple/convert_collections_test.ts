import 'mocha';
import { expect } from 'chai';
import {
	dataToCollections,
	collectionsPrefixes,
	filterCollections,
	CollectionsList,
} from '../../lib/converters/collections';
import { CollectionInfo } from '../../lib/converters/collection';
import { getFixture } from '../get_fixture';
import { defaultCollectionInfo } from '../collection_info';

describe('Testing converting collections list', () => {
	it('Simple info', () => {
		let result, expected: CollectionsList;

		// Empty block
		result = dataToCollections({});
		expect(result).to.be.eql({});

		// Block with one item without category
		result = dataToCollections({
			foo: {
				name: 'Foo',
			},
		});
		expect(result).to.be.eql({});
		expect(collectionsPrefixes(result)).to.be.eql([]);

		// Block with one item with category
		result = dataToCollections({
			foo: {
				name: 'Foo',
				category: 'General',
			},
		});
		expected = {
			General: {
				foo: Object.assign(defaultCollectionInfo(), {
					prefix: 'foo',
					name: 'Foo',
					category: 'General',
				}),
			},
		};
		expect(result).to.be.eql(expected);
		expect(collectionsPrefixes(result)).to.be.eql(['foo']);

		// Two items in same category
		result = dataToCollections({
			foo: {
				name: 'Foo',
				category: 'General',
			},
			bar: {
				name: 'Bar',
				category: 'General',
			},
		});
		expected = {
			General: {
				foo: Object.assign(defaultCollectionInfo(), {
					prefix: 'foo',
					name: 'Foo',
					category: 'General',
				}),
				bar: Object.assign(defaultCollectionInfo(), {
					prefix: 'bar',
					name: 'Bar',
					category: 'General',
				}),
			},
		};
		expect(result).to.be.eql(expected);
		expect(collectionsPrefixes(result)).to.be.eql(['foo', 'bar']);

		// Different categories
		result = dataToCollections({
			foo: {
				name: 'Foo',
				category: 'General',
			},
			bar: {
				name: 'Bar',
				category: 'Bar',
			},
		});
		expected = {
			General: {
				foo: Object.assign(defaultCollectionInfo(), {
					prefix: 'foo',
					name: 'Foo',
					category: 'General',
				}),
			},
			Bar: {
				bar: Object.assign(defaultCollectionInfo(), {
					prefix: 'bar',
					name: 'Bar',
					category: 'Bar',
				}),
			},
		};
		expect(result).to.be.eql(expected);
		expect(collectionsPrefixes(result)).to.be.eql(['foo', 'bar']);

		// Empty category
		result = dataToCollections({
			foo: {
				name: 'Foo',
				category: 'General',
			},
			bar: {
				name: 'Bar',
				category: '',
			},
		});
		expected = {
			'General': {
				foo: Object.assign(defaultCollectionInfo(), {
					prefix: 'foo',
					name: 'Foo',
					category: 'General',
				}),
			},
			'': {
				bar: Object.assign(defaultCollectionInfo(), {
					prefix: 'bar',
					name: 'Bar',
					category: '',
				}),
			},
		};
		expect(result).to.be.eql(expected);
		expect(collectionsPrefixes(result)).to.be.eql(['foo', 'bar']);

		// Categories order
		result = dataToCollections({
			foo: {
				name: 'Foo',
				category: 'General',
			},
			bar: {
				name: 'Bar',
				category: 'Bar',
			},
			baz: {
				name: 'Baz',
				category: 'General',
			},
		});
		expected = {
			General: {
				foo: Object.assign(defaultCollectionInfo(), {
					prefix: 'foo',
					name: 'Foo',
					category: 'General',
				}),
				baz: Object.assign(defaultCollectionInfo(), {
					prefix: 'baz',
					name: 'Baz',
					category: 'General',
				}),
			},
			Bar: {
				bar: Object.assign(defaultCollectionInfo(), {
					prefix: 'bar',
					name: 'Bar',
					category: 'Bar',
				}),
			},
		};
		expect(result).to.be.eql(expected);
		expect(collectionsPrefixes(result)).to.be.eql(['foo', 'baz', 'bar']);
	});

	it('collections.json', () => {
		const raw = JSON.parse(getFixture('collections.json'));
		const result = dataToCollections(raw);

		// Test categories
		expect(Object.keys(result)).to.be.eql(['General', 'Emoji', 'Thematic']);

		// Test prefixes
		const prefixes = collectionsPrefixes(result);
		expect(prefixes.length).to.be.equal(62);
		expect(prefixes.slice(0, 5)).to.be.eql([
			'mdi',
			'mdi-light',
			'ic',
			'uil',
			'jam',
		]);
		expect(prefixes.slice(-5)).to.be.eql([
			'cryptocurrency',
			'wi',
			'geo',
			'map',
			'medical-icon',
		]);

		// Test info for ant-design
		const expected: CollectionInfo = {
			prefix: 'ant-design',
			name: 'Ant Design Icons',
			version: '',
			total: 728,
			author: {
				name: 'HeskeyBaozi',
				url: 'https://github.com/ant-design/ant-design-icons',
			},
			license: {
				title: 'MIT',
				spdx: '',
				url: '',
			},
			height: 16,
			samples: ['pushpin', 'pie-chart-outline', 'user-add-outline'],
			displayHeight: 16,
			palette: false,
			category: 'General',
		};
		expect(result.General['ant-design']).to.be.eql(expected);
	});

	it('Filter collections', () => {
		const raw = JSON.parse(getFixture('collections.json'));
		const collections = dataToCollections(raw);
		let result: CollectionsList;
		let prefixes: string[];

		// Filter by prefix
		result = filterCollections(
			collections,
			(item: CollectionInfo, category: string, prefix: string) => {
				expect(item.prefix).to.be.equal(prefix);
				expect(item.category).to.be.equal(category);

				// Only "mdi", "mdi-*"
				return item.prefix.split('-').shift() === 'mdi';
			}
		);

		expect(Object.keys(result)).to.be.eql(['General']);
		prefixes = collectionsPrefixes(result);
		expect(prefixes).to.be.eql(['mdi', 'mdi-light']);

		// Filter by prefix with multiple categories
		result = filterCollections(
			collections,
			(item: CollectionInfo, category: string, prefix: string) => {
				expect(item.prefix).to.be.equal(prefix);
				expect(item.category).to.be.equal(category);

				// Only "fa", "fa-*"
				return item.prefix.split('-').shift() === 'fa';
			}
		);

		expect(Object.keys(result)).to.be.eql(['General', 'Thematic']);
		prefixes = collectionsPrefixes(result);
		expect(prefixes).to.be.eql([
			'fa-solid',
			'fa-regular',
			'fa',
			'fa-brands',
		]);

		// Filter by name and palette
		result = filterCollections(
			collections,
			(item: CollectionInfo, category: string, prefix: string) => {
				expect(item.prefix).to.be.equal(prefix);
				expect(item.category).to.be.equal(category);

				// Only "Emoji" and only with palette
				return (
					item.palette &&
					item.name.toLowerCase().indexOf('emoji') !== -1
				);
			}
		);

		expect(Object.keys(result)).to.be.eql(['Emoji']);
		prefixes = collectionsPrefixes(result);
		expect(prefixes).to.be.eql([
			'noto',
			'noto-v1',
			'twemoji',
			'emojione',
			'emojione-v1',
			'fxemoji',
		]);
	});
});
