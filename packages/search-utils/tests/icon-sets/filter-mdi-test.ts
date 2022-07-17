/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { filterIconSet } from '../../lib/data/icon-set/filter/filters';
import { getIconSetIconClickableFilters } from '../../lib/data/icon-set/filter/get-filters';
import { convertAPIv2IconSet } from '../../lib/data/icon-set/convert/api-v2';
import { findReferenceIconSetIcon } from '../../lib/data/icon-set/reference';
import type { APIv2CollectionResponse } from '../../lib/data/api-types/v2';
import type { IconFinderIconSetFilters } from '../../lib/data/icon-set/types/icon-set';
import type { IconFinderFilter } from '../../lib/data/filters/types/filter';

describe('Filter Material Design Icons', () => {
	// Check filters
	function checkFilters(
		filters: IconFinderIconSetFilters,
		disabled: IconFinderFilter[] = []
	): boolean {
		// All filters should be enabled
		for (const key in filters) {
			const filter = filters[key as keyof typeof filters]!;
			const list = filter.filters;
			for (let i = 0; i < list.length; i++) {
				const item = list[i];
				const expectedDisabled =
					disabled && disabled.indexOf(item) !== -1;
				if (!!item.disabled !== expectedDisabled) {
					console.error(`Failed at ${key}: ${item.title}`);
					return false;
				}
			}
		}
		return true;
	}

	// Find filter
	function findFilter(
		filters: IconFinderFilter[],
		title: string
	): IconFinderFilter | undefined {
		return filters.find((item) => item.title === title);
	}

	it('Filter by tag', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('api-v2/mdi.json')
		) as APIv2CollectionResponse;
		const iconSet = convertAPIv2IconSet('', rawData)!;

		const filters = iconSet.filters;

		// All filters should be enabled
		checkFilters(filters);

		// Get tags
		const natureTagFilter = findFilter(filters.tags!.filters, 'Nature');
		const animalTagFilter = findFilter(filters.tags!.filters, 'Animal');
		const agricultureTagFilter = findFilter(
			filters.tags!.filters,
			'Agriculture'
		);
		expect(natureTagFilter).toBeTruthy();
		expect(animalTagFilter).toBeTruthy();
		expect(agricultureTagFilter).toBeTruthy();

		//
		// Filter by 'Nature' tag
		//
		filters.tags!.selected = natureTagFilter;
		let icons = filterIconSet(iconSet, '');

		// Same icon with 2 names: only 1 can be present
		const flowerPollenOutline = icons.icons.find(
			(item) => item.name === 'flower-pollen-outline'
		);
		const allergyOutline = icons.icons.find(
			(item) => item.name === 'allergy-outline'
		);
		expect(flowerPollenOutline).toBeTruthy();
		expect(allergyOutline).toBeUndefined();

		// Check total length
		expect(icons.icons.length).toBe(78);

		// Check filters for 'bee', which should be in results
		expect(icons.icons.find((item) => item.name === 'bee')).toBeTruthy();
		let clickableFilters = getIconSetIconClickableFilters(iconSet, 'bee');
		expect(clickableFilters).toEqual([
			agricultureTagFilter,
			animalTagFilter,
		]);

		// Get index for few icons
		expect(findReferenceIconSetIcon(iconSet, icons, 'bee')).toBe(0);
		expect(findReferenceIconSetIcon(iconSet, icons, 'account')).toBe(-1);

		//
		// Filter by 'bee' without active tag
		//
		delete filters.tags!.selected;
		icons = filterIconSet(iconSet, 'bee');

		// Check total length
		expect(icons.icons.length).toBe(11);

		// Check filters for 'bee', which should be in results
		expect(icons.icons.find((item) => item.name === 'bee')).toBeTruthy();
		clickableFilters = getIconSetIconClickableFilters(iconSet, 'bee');
		expect(clickableFilters).toEqual([
			agricultureTagFilter,
			animalTagFilter,
			natureTagFilter,
		]);

		// Get index for few icons
		expect(findReferenceIconSetIcon(iconSet, icons, 'bee')).toBe(0);
		expect(findReferenceIconSetIcon(iconSet, icons, 'beef')).toBe(2); // alias of 'food-steak'
		expect(findReferenceIconSetIcon(iconSet, icons, 'food-steak')).toBe(2);
		expect(findReferenceIconSetIcon(iconSet, icons, 'marker-tick')).toBe(7); // alias of 'marker-check', which has alias 'beenhere' that should be in results
		expect(findReferenceIconSetIcon(iconSet, icons, 'account')).toBe(-1);
	});
});
