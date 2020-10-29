import 'mocha';
import { expect } from 'chai';
import type { SearchResults } from '../../lib/converters/search';
import { dataToSearchResults } from '../../lib/converters/search';
import type { CollectionInfo } from '../../lib/converters/collection';
import { dataToCollectionInfo } from '../../lib/converters/collection';
import type { Icon } from '../../lib/icon';
import { stringToIcon } from '../../lib/icon';
import { getFixture } from '../get_fixture';

describe('Testing converting search results', () => {
	it('Simple data', () => {
		let result, expected: SearchResults;

		// Empty block
		result = dataToSearchResults('', {});
		expect(result).to.be.equal(null);

		// Add minimum data
		result = dataToSearchResults('', {
			icons: ['foo:bar'],
			total: 1,
			limit: 64,
			collections: {
				foo: {
					name: 'Foo',
				},
			},
			request: {
				query: 'bar',
			},
		});
		expected = {
			provider: '',
			query: 'bar',
			total: 1,
			limit: 64,
			icons: [stringToIcon('foo:bar') as Icon],
			collections: {
				foo: dataToCollectionInfo(
					{
						name: 'Foo',
					},
					'foo'
				) as CollectionInfo,
			},
		};
		expect(result).to.be.eql(expected);

		// Missing collection info
		result = dataToSearchResults('', {
			icons: ['foo:bar'],
			total: 1,
			limit: 64,
			collections: {},
			request: {
				query: 'bar',
			},
		});
		expect(result).to.be.equal(null);

		// Missing limit
		result = dataToSearchResults('', {
			icons: ['foo:bar'],
			total: 1,
			collections: {
				foo: {
					name: 'Foo',
				},
			},
			request: {
				query: 'bar',
			},
		});
		expect(result).to.be.equal(null);

		// Missing query
		result = dataToSearchResults('', {
			icons: ['foo:bar'],
			total: 1,
			limit: 64,
			collections: {
				foo: {
					name: 'Foo',
				},
			},
			request: {},
		});
		expect(result).to.be.equal(null);

		// Empty results
		result = dataToSearchResults('', {
			icons: [],
			total: 0,
			limit: 64,
			collections: {},
			request: {
				query: 'bar',
			},
		});
		expected = {
			provider: '',
			query: 'bar',
			total: 0,
			limit: 64,
			icons: [],
			collections: {},
		};
		expect(result).to.be.eql(expected);
	});

	it('fa-home with custom provider', () => {
		const raw = JSON.parse(getFixture('search-fa-home.json'));
		const result = dataToSearchResults('custom-provider', raw);

		const expected: SearchResults = {
			provider: 'custom-provider',
			query: 'home',
			total: 3,
			limit: 64,
			icons: [
				stringToIcon('@custom-provider:fa-solid:home') as Icon,
				stringToIcon('@custom-provider:fa:home') as Icon,
				stringToIcon(
					'@custom-provider:fa-solid:tachometer-alt'
				) as Icon,
			],
			collections: {
				'fa-solid': dataToCollectionInfo(
					raw.collections['fa-solid'],
					'fa-solid'
				) as CollectionInfo,
				'fa': dataToCollectionInfo(
					raw.collections['fa'],
					'fa'
				) as CollectionInfo,
			},
		};
		expect(result).to.be.eql(expected);
	});
});
