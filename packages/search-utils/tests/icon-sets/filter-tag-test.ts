/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import { loadFixture } from '../../lib/tests/helpers';
import { convertRawIconSet } from '../../lib/data/icon-set/convert/raw';
import { filterIconSet } from '../../lib/data/icon-set/filter/filters';
import { getIconSetIconClickableFilters } from '../../lib/data/icon-set/filter/get-filters';

describe('Filter icon set by tag', () => {
	it('Testing line-md from IconifyJSON', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('icon-sets/line-md.json')
		) as IconifyJSON;
		const iconSet = convertRawIconSet('', rawData)!;

		const filters = iconSet.filters;

		// All filters should be enabled
		for (const key in filters) {
			const filter = filters[key as keyof typeof filters]!;
			filter.filters.forEach((item) => {
				if (item.disabled) {
					console.error(`Failed at ${key}: ${item.title}`);
				}
				expect(item.disabled).toBeFalsy();
			});
		}

		// Get few filters for testing below
		const arrowsTag = filters.tags?.filters[2];
		expect(arrowsTag).toBeTruthy();
		expect(arrowsTag?.title).toEqual('Arrows');

		const editingTag = filters.tags?.filters[3];
		expect(editingTag).toBeTruthy();
		expect(editingTag?.title).toEqual('Editing');

		const fadeInSuffix = filters.suffixes?.filters[0];
		expect(fadeInSuffix).toBeTruthy();
		expect(fadeInSuffix?.title).toEqual('Fade In');

		// All icons should be shown
		let icons = filterIconSet(iconSet, '');
		expect(icons.icons.length).toBe(iconSet.total);

		// Test clickable filters
		let clickableFilters = getIconSetIconClickableFilters(
			iconSet,
			'arrow-left'
		);
		expect(clickableFilters).toEqual([fadeInSuffix, arrowsTag]);

		//
		// Set tag to 'Arrows'
		//
		filters.tags!.selected = arrowsTag;

		icons = filterIconSet(iconSet, '');
		expect(icons.icons.length).not.toBe(iconSet.total);

		// 'arrow-left' and its alias 'arrow-right' should be there
		expect(
			icons.icons.find((item) => item.name === 'arrow-left')
		).toBeTruthy();
		expect(
			icons.icons.find((item) => item.name === 'arrow-right')
		).toBeTruthy();

		// 'align-left' and 'align-right' should not be there
		expect(
			icons.icons.find((item) => item.name === 'align-left')
		).toBeUndefined();
		expect(
			icons.icons.find((item) => item.name === 'align-right')
		).toBeUndefined();

		// Test clickable filters
		clickableFilters = getIconSetIconClickableFilters(
			iconSet,
			'arrow-left'
		);
		expect(clickableFilters).toEqual([fadeInSuffix]);

		//
		// Add keywords filter 'right'
		//
		icons = filterIconSet(iconSet, 'right');
		expect(icons.icons.length).not.toBe(iconSet.total);

		// 'arrow-left' should not be there
		expect(
			icons.icons.find((item) => item.name === 'arrow-left')
		).toBeUndefined();

		// 'arrow-right' should be there
		expect(
			icons.icons.find((item) => item.name === 'arrow-right')
		).toBeTruthy();

		// 'align-left' and 'align-right' should not be there
		expect(
			icons.icons.find((item) => item.name === 'align-left')
		).toBeUndefined();
		expect(
			icons.icons.find((item) => item.name === 'align-right')
		).toBeUndefined();

		// Test clickable filters
		clickableFilters = getIconSetIconClickableFilters(
			iconSet,
			'arrow-left'
		);
		expect(clickableFilters).toEqual([fadeInSuffix]);

		// Filters for icon not currently visible
		clickableFilters = getIconSetIconClickableFilters(
			iconSet,
			'align-right'
		);
		expect(clickableFilters).toEqual([fadeInSuffix, editingTag]);

		//
		// Filter by suffix
		///
		filters.suffixes!.selected = fadeInSuffix;
		icons = filterIconSet(iconSet, 'right');

		// Test clickable filters
		clickableFilters = getIconSetIconClickableFilters(
			iconSet,
			'arrow-left'
		);
		expect(clickableFilters).toEqual([]);
	});
});
