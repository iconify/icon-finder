/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { convertAPIv2SearchResults } from '../../lib/data/search/convert/api-v2';
import { getCollectionFilterFromIconsList } from '../../lib/data/icons-list/filter/get-filters';
import type { APIv2SearchResponse } from '../../lib/api/types/v2';
import type { IconFinderGenericIconName } from '../../lib/data/icon/types/name';

function findIcon(
	icons: IconFinderGenericIconName[],
	prefix: string,
	name: string
): IconFinderGenericIconName | undefined {
	return icons.find((item) => item.prefix === prefix && item.name === name);
}

describe('Convert search results from API', () => {
	it('Without limit', async () => {
		const data = JSON.parse(
			await loadFixture('api-v2/search-home.json')
		) as APIv2SearchResponse;

		const results = convertAPIv2SearchResults('', data);
		expect(results).toBeTruthy();

		// Check icons
		const icons = results.icons;
		const charmHomeIcon = findIcon(icons, 'charm', 'home');
		expect(charmHomeIcon).toEqual({
			provider: '',
			prefix: 'charm',
			name: 'home',
		});

		// Check filters
		const filters = results.filters.collections!;
		const charmFilter = filters.collections.get('charm');
		expect(charmFilter).toEqual({
			key: 'collectionscharm',
			title: 'Charm Icons',
			prefix: 'charm',
			color: 7,
		});
		expect(filters.filters[7]).toBe(charmFilter);

		expect(getCollectionFilterFromIconsList(results, 'charm')).toBe(
			charmFilter
		);
	});
});
