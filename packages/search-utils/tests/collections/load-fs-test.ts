/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fixturesDirectory, nextProvider } from '../../lib/tests/helpers';
import { collectionsFSLoader } from '../../lib/data/collections/loaders/fs';
import { collectionsStorage } from '../../lib/data/collections/storage';
import { loadStorageItem } from '../../lib/data/storage/functions';

describe('Loading collections from file system', () => {
	it('Loading collections list', async () => {
		const provider = '';
		const data = await loadStorageItem(
			collectionsStorage,
			collectionsFSLoader.bind(
				null,
				fixturesDirectory + 'collections/all.json'
			),
			provider
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const collections = data.data!;
		expect(collections.total).toBe(121);

		// Loading icon set again should return cache
		const data2 = await loadStorageItem(
			collectionsStorage,
			collectionsFSLoader.bind(
				null,
				fixturesDirectory + 'bad-directory/line-md.json'
			),
			provider
		);

		expect(data2).toBe(data);
		expect(data2.data).toBe(collections);
	});

	it('Custom provider', async () => {
		const provider = nextProvider();

		// Make sure collections list is not in storage
		expect(collectionsStorage.storage.get(provider)).toBeUndefined();

		// Load data
		const data = await loadStorageItem(
			collectionsStorage,
			collectionsFSLoader.bind(
				null,
				fixturesDirectory + 'collections/all.json'
			),
			provider
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const collections = data.data!;
		expect(collections.total).toBe(121);

		// Make sure collections list is available in storage
		const storedCollections = collectionsStorage.storage.get(provider);
		expect(storedCollections).toBeDefined();
		expect(storedCollections!.data).toBeDefined();
	});

	it('Invalid file', async () => {
		const provider = nextProvider();
		const data = await loadStorageItem(
			collectionsStorage,
			collectionsFSLoader.bind(
				null,
				fixturesDirectory + 'dir/missing-file.json'
			),
			provider
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(404);
	});

	it('Bad data', async () => {
		const provider = nextProvider();
		const data = await loadStorageItem(
			collectionsStorage,
			collectionsFSLoader.bind(
				null,
				fixturesDirectory + 'api-v2/line-md.json'
			),
			provider
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(503);
	});
});
