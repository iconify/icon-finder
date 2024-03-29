/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { fixturesDirectory, nextProvider } from '../../lib/tests/helpers';
import { iconSetFSLoader } from '../../lib/data/icon-set/loaders/fs';
import { iconSetsStorage } from '../../lib/data/icon-set/storage';
import { loadStorageItem } from '../../lib/data/storage/functions';

describe('Loading icon set from file system', () => {
	it('Loading icon set', async () => {
		const provider = '';
		const prefix = 'line-md';

		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'icon-sets/line-md.json'
			),
			{ provider, prefix }
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const iconSet = data.data!;
		expect(iconSet.id).toEqual({
			provider,
			prefix,
		});
		expect(iconSet.total).toBe(256);

		// Loading icon set again should return cache
		const data2 = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'bad-directory/line-md.json'
			),
			{ provider, prefix }
		);

		expect(data2).toBe(data);
		expect(data2.data).toBe(iconSet);
	});

	it('Custom provider', async () => {
		const provider = nextProvider();
		const prefix = 'line-md';
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'icon-sets/line-md.json'
			),
			{ provider, prefix }
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const iconSet = data.data!;
		expect(iconSet.id).toEqual({
			provider,
			prefix,
		});
		expect(iconSet.total).toBe(256);
	});

	it('Invalid file', async () => {
		const provider = nextProvider();
		const prefix = 'line-md';
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'dir/missing-file.json'
			),
			{ provider, prefix }
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(404);
	});

	it('Mismatched prefix', async () => {
		const provider = nextProvider();
		const prefix = 'test';
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'icon-sets/line-md.json'
			),
			{ provider, prefix }
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(503);
	});

	it('Bad data', async () => {
		const provider = nextProvider();
		const prefix = 'line-md';
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetFSLoader.bind(
				null,
				fixturesDirectory + 'api-v2/line-md.json'
			),
			{ provider, prefix }
		);

		// Error
		expect(data.data).toBeUndefined();
		expect(data.error).toBe(503);
	});
});
