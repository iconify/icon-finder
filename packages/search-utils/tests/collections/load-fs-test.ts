/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fixturesDirectory, nextProvider } from '../../lib/tests/helpers';
import { loadCollectionsFromFS } from '../../lib/data/collections/loaders/fs';

describe('Loading collections from file system', () => {
	it('Loading collecitons list', async () => {
		const provider = '';
		const data = await loadCollectionsFromFS(
			provider,
			fixturesDirectory + 'collections/all.json'
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const collections = data.data!;
		expect(collections.total).toBe(121);

		// Loading icon set again should return cache
		const data2 = await loadCollectionsFromFS(
			provider,
			fixturesDirectory + 'bad-directory/line-md.json'
		);
		expect(data2).toBe(data);
		expect(data2.data).toBe(collections);
	});

	it('Custom provider', async () => {
		const provider = nextProvider();
		const data = await loadCollectionsFromFS(
			provider,
			fixturesDirectory + 'collections/all.json'
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const collections = data.data!;
		expect(collections.total).toBe(121);
	});

	it('Invalid file', async () => {
		const provider = nextProvider();
		const data = await loadCollectionsFromFS(
			provider,
			fixturesDirectory + 'dir/missing-file.json'
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(404);
	});

	it('Bad data', async () => {
		const provider = nextProvider();
		const data = await loadCollectionsFromFS(
			provider,
			fixturesDirectory + 'api-v2/line-md.json'
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(503);
	});
});
