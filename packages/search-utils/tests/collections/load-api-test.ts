/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	collectionsAPIURI,
	nextMockedAPIProvider,
} from '../../lib/tests/api-data';
import { loadCollectionsFromAPIv2 } from '../../lib/data/collections/loaders/api-v2';
import { loadFixture } from '../../lib/tests/helpers';
import { collectionsStorage } from '../../lib/data/storage/data/collections';
import { mockAPIData } from '../../lib/tests/api-mock';

describe('Loading collections from API', () => {
	it('Loading collections list', async () => {
		const provider = nextMockedAPIProvider();

		// Make sure collections list is not in storage
		expect(collectionsStorage.storage.get(provider)).toBeUndefined();

		// Fake API response
		const response = JSON.parse(
			await loadFixture('collections/all.json')
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: collectionsAPIURI(),
			response,
		});

		const data = await loadCollectionsFromAPIv2(provider);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const collections = data.data!;
		expect(collections.total).toBe(121);

		// Make sure collections list is available
		const storedCollections = collectionsStorage.storage.get(provider);
		expect(storedCollections).toBeDefined();
		expect(storedCollections!.data).toBeDefined();
	});

	it('Error', async () => {
		const provider = nextMockedAPIProvider();

		// Make sure collections list is not in storage
		expect(collectionsStorage.storage.get(provider)).toBeUndefined();

		// Get data without mocking API response
		const data = await loadCollectionsFromAPIv2(provider);

		// Should return 404
		expect(data.error).toBe(404);
		expect(data.data).toBeUndefined();

		// Make sure collections list is not available
		const storedCollections = collectionsStorage.storage.get(provider);
		expect(storedCollections).toBeDefined();
		expect(storedCollections!.data).toBeUndefined();
		expect(storedCollections!.error).toBe(404);
	});
});
