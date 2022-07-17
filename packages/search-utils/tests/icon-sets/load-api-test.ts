/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	collectionsAPIURI,
	iconSetAPIURI,
	nextMockedAPIProvider,
} from '../../lib/tests/api-data';
import { loadIconSetFromAPIv2 } from '../../lib/data/icon-set/loaders/api-v2';
import { collectionsStorage } from '../../lib/data/storage/data/collections';
import { loadFixture } from '../../lib/tests/helpers';
import { mockAPIData } from '../../lib/tests/api-mock';

describe('Loading icon set from API', () => {
	it('Loading icon set', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

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

		// Icon set
		const response = JSON.parse(
			await loadFixture(`api-v2/${prefix}.json`)
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: iconSetAPIURI(prefix),
			response,
		});

		const data = await loadIconSetFromAPIv2(provider, prefix);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const iconSet = data.data!;
		expect(iconSet.total).toBe(310);

		// Make sure collections list is available
		const collections = collectionsStorage.storage.get(provider);
		expect(collections).toBeDefined();
		expect(collections!.data).toBeDefined();
	});

	it('Invalid collections list response', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

		// Icon set
		const response = JSON.parse(
			await loadFixture(`api-v2/${prefix}.json`)
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: iconSetAPIURI(prefix),
			response,
		});

		const data = await loadIconSetFromAPIv2(provider, prefix);

		// Should return 404
		expect(data.error).toBe(404);
		expect(data.data).toBeUndefined();
	});

	it('Invalid icon set response', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

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

		const data = await loadIconSetFromAPIv2(provider, prefix);

		// Should return 404
		expect(data.error).toBe(404);
		expect(data.data).toBeUndefined();
	});

	it('Delay collections list', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

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

		// Icon set
		const response = JSON.parse(
			await loadFixture(`api-v2/${prefix}.json`)
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: iconSetAPIURI(prefix),
			response,
		});

		const data = await loadIconSetFromAPIv2(provider, prefix);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const iconSet = data.data!;
		expect(iconSet.total).toBe(310);
	});
});
