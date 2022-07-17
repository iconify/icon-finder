/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { iconSetAPIURI, nextMockedAPIProvider } from '../../lib/tests/api-data';
import { iconSetAPIv2Loader } from '../../lib/data/icon-set/loaders/api-v2';
import { iconSetsStorage } from '../../lib/data/icon-set/storage';
import { loadStorageItem } from '../../lib/data/storage/functions';
import { loadFixture } from '../../lib/tests/helpers';
import { mockAPIData } from '../../lib/tests/api-mock';

describe('Loading icon set from API', () => {
	it('Loading icon set', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

		// Load response
		const response = JSON.parse(
			await loadFixture(`api-v2/${prefix}.json`)
		) as Record<string, unknown>;
		mockAPIData({
			type: 'custom',
			provider,
			uri: iconSetAPIURI(prefix),
			response,
		});

		// Load data
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetAPIv2Loader,
			{ provider, prefix }
		);

		// Error should be empty, data should be set
		expect(data.error).toBeUndefined();
		expect(data.data).toBeDefined();

		const iconSet = data.data!;
		expect(iconSet.total).toBe(310);
	});

	it('Invalid response', async () => {
		const provider = nextMockedAPIProvider();
		const prefix = 'line-md';

		// Load item without preloading response
		const data = await loadStorageItem(
			iconSetsStorage,
			iconSetAPIv2Loader,
			{ provider, prefix }
		);

		// Should return 404
		expect(data.error).toBe(404);
		expect(data.data).toBeUndefined();
	});
});
