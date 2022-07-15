/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { convertAPIv2SearchResults } from '../../lib/search/convert/api-v2';
import { getCollectionFilterFromIconsList } from '../../lib/icons-list/filter/get-filters';
import { filterGenericIconsList } from '../../lib/icons-list/filter/filters';
import type { APIv2SearchResponse } from '../../lib/api/types/v2';
import type { IconFinderGenericIconName } from '../../lib/icon/types/name';

function findIcon(
	icons: IconFinderGenericIconName[],
	prefix: string,
	name: string
): IconFinderGenericIconName | undefined {
	return icons.find((item) => item.prefix === prefix && item.name === name);
}

describe('Filtering search results', () => {
	it('Testing filters', async () => {
		// Convert
		const data = JSON.parse(
			await loadFixture('api-v2/search-home.json')
		) as APIv2SearchResponse;

		const searchResults = convertAPIv2SearchResults('', data);
		expect(searchResults).toBeTruthy();

		const filters = searchResults.filters.collections!;
		expect(filters).toBeTruthy();

		const totalIcons = searchResults.icons.length;
		expect(totalIcons).toBe(64);

		//
		// Empty filter
		//
		let filtered = filterGenericIconsList(searchResults);
		let icons = filtered.icons;

		// Icons list should be cloned, but have same content
		expect(icons).not.toBe(searchResults.icons);
		expect(icons).toEqual(searchResults.icons);

		// Icon objects should be identical
		expect(icons[0]).toBe(searchResults.icons[0]);

		// Check icons
		const charmHomeIcon = findIcon(icons, 'charm', 'home');
		expect(charmHomeIcon).toEqual({
			provider: '',
			prefix: 'charm',
			name: 'home',
		});

		// Check filters
		expect(filtered.filters).toBe(searchResults.filters);
		const charmFilter = filters.collections.get('charm');
		expect(charmFilter).toEqual({
			key: 'collectionscharm',
			title: 'Charm Icons',
			prefix: 'charm',
			color: 7,
		});
		expect(filters.filters[7]).toBe(charmFilter);

		expect(getCollectionFilterFromIconsList(filtered, 'charm')).toBe(
			charmFilter
		);

		//
		// Filter
		//
		filters.selected = charmFilter;

		filtered = filterGenericIconsList(searchResults);

		// Icons list should be cloned
		icons = filtered.icons;
		expect(icons).not.toBe(searchResults.icons);
		expect(icons.length).toBe(1);

		// Check icons
		expect(findIcon(icons, 'charm', 'home')).toBe(charmHomeIcon);
	});
});
