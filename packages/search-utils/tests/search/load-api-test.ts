/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	collectionsAPIURI,
	searchAPIURI,
	nextMockedAPIProvider,
} from '../../lib/tests/api-data';
import { getSearchResultsFromAPIv2 } from '../../lib/data/search/loaders/api-v2';
import { collectionsStorage } from '../../lib/data/storage/data/collections';
import { loadFixture } from '../../lib/tests/helpers';
import { mockAPIData } from '../../lib/tests/api-mock';
import type { IconFinderSearchQuery } from '../../lib/data/search/types/query';

describe('Loading search results from API', () => {
	it('Loading search results', async () => {
		const provider = nextMockedAPIProvider();

		// Make sure collections list is not in storage
		expect(collectionsStorage.storage.get(provider)).toBeUndefined();

		// Collections list
		const collectionsResponse = JSON.parse(
			await loadFixture('collections/all.json')
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: collectionsAPIURI(),
			response: collectionsResponse,
		});

		// Results
		const query: IconFinderSearchQuery = {
			provider,
			keyword: 'home',
			limit: 64,
		};
		const response = JSON.parse(
			await loadFixture('api-v2/search-home.json')
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: searchAPIURI(query),
			response,
		});

		const data = await getSearchResultsFromAPIv2(query);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const results = data.data!;
		expect(results.icons.length).toBe(64);
		expect(results.gotMaxResults).toBe(true);

		// Make sure collections list is available
		const collections = collectionsStorage.storage.get(provider);
		expect(collections).toBeDefined();
		expect(collections!.data).toBeDefined();
	});

	it('Delay collections list', async () => {
		const provider = nextMockedAPIProvider();

		// Make sure collections list is not in storage
		expect(collectionsStorage.storage.get(provider)).toBeUndefined();

		// Collections list
		const collectionsResponse = JSON.parse(
			await loadFixture('collections/all.json')
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: collectionsAPIURI(),
			response: collectionsResponse,
			delay: 1000,
		});

		// Results
		const query: IconFinderSearchQuery = {
			provider,
			keyword: 'home',
			limit: 999,
		};
		const response = JSON.parse(
			await loadFixture('api-v2/search-home-999.json')
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: searchAPIURI(query),
			response,
		});

		const data = await getSearchResultsFromAPIv2(query);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const results = data.data!;
		expect(results.icons.length).toBe(455);
		expect(results.gotMaxResults).toBe(false);

		// Make sure collections list is available
		const collections = collectionsStorage.storage.get(provider);
		expect(collections).toBeDefined();
		expect(collections!.data).toBeDefined();
	});
});
