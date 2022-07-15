/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import { loadFixture } from '../../lib/tests/helpers';
import { convertRawIconSet } from '../../lib/data/icon-set/convert/raw';
import { filterIconSetUniqueIconsByKeyword } from '../../lib/data/icon-set/filter/keyword';
import type { IconFinderIconSetUniqueIcon } from '../../lib/data/icon-set/types/icons';

describe('Filter icon set by keyword', () => {
	it('Testing line-md from IconifyJSON', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('icon-sets/line-md.json')
		) as IconifyJSON;
		const iconSet = convertRawIconSet('', rawData)!;

		const filters = iconSet.filters;
		const total = iconSet.total;

		// Function to test filters
		const testFilters = (
			key: keyof typeof filters,
			expectedEnabled: Set<string>
		) => {
			const list = filters[key]!;
			list.filters.forEach((item) => {
				const enabled = !item.disabled;
				const enabled2 = expectedEnabled.has(item.title);
				if (enabled !== enabled2) {
					console.log(
						`Failed at ${key}: ${item.title}. Expected it to be ${
							enabled2 ? 'enabled' : 'disabled'
						}`
					);
				}
				expect(enabled).toBe(enabled2);
			});
		};

		const testIconsList = (
			icons: IconFinderIconSetUniqueIcon[],
			list: Set<string>
		) => {
			icons.forEach((item) => {
				item.icons.forEach(({ name }) => {
					if (!list.has(name)) {
						console.error(
							`Expected icons list to include "${name}"`
						);
					}
					expect(list.has(name)).toBe(true);
					list.delete(name);
				});
			});

			if (list.size) {
				console.error(`Expected icons list to include:`, list);
			}
			expect(list.size).toBe(0);
		};

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

		//
		// Apply empty filter
		//
		let icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			''
		);
		expect(icons.length).toBe(total);

		// Icons list should be different
		expect(icons).not.toBe(iconSet.icons.unique);

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

		// Hidden icons should not be in list
		icons.forEach((item) => {
			item.icons.forEach(({ name }) => {
				expect(name).not.toBe('iconify2');
			});
		});

		//
		// Apply 'home' filter
		//
		icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			'home'
		);
		expect(icons.length).not.toBe(total);

		// Make sure only icons that include 'home' are in list
		testIconsList(
			icons,
			new Set([
				'home',
				'home-md',
				'home-md-twotone',
				'home-md-twotone-alt',
				'home-simple',
				'home-simple-filled',
				'home-simple-twotone',
				'home-twotone',
				'home-twotone-alt',
			])
		);

		// Check suffixes and tags
		testFilters('suffixes', new Set(['Fade In']));
		testFilters('tags', new Set(['Navigation']));

		//
		// Reset filters
		//
		icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			''
		);
		expect(icons.length).toBe(total);

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

		//
		// Direct match for hidden icon
		//
		icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			'iconify2'
		);
		expect(icons.length).toBe(1);

		// Make sure icons list includes only hidden icon
		testIconsList(icons, new Set(['iconify2']));

		// Check suffixes and tags
		testFilters('suffixes', new Set(['Fade In']));
		testFilters('tags', new Set());
	});

	it('Testing octicon from IconifyJSON', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('icon-sets/octicon.json')
		) as IconifyJSON;
		const iconSet = convertRawIconSet('', rawData)!;

		const filters = iconSet.filters;

		// Function to test filters
		const testFilters = (
			key: keyof typeof filters,
			expectedEnabled: Set<string>
		) => {
			const list = filters[key]!;
			list.filters.forEach((item) => {
				const enabled = !item.disabled;
				const enabled2 = expectedEnabled.has(item.title);
				if (enabled !== enabled2) {
					console.log(
						`Failed at ${key}: ${item.title}. Expected it to be ${
							enabled2 ? 'enabled' : 'disabled'
						}`
					);
				}
				expect(enabled).toBe(enabled2);
			});
		};

		const testIconsList = (
			icons: IconFinderIconSetUniqueIcon[],
			list: Set<string>
		) => {
			icons.forEach((item) => {
				item.icons.forEach(({ name }) => {
					if (!list.has(name)) {
						console.error(
							`Expected icons list to include "${name}"`
						);
					}
					expect(list.has(name)).toBe(true);
					list.delete(name);
				});
			});

			if (list.size) {
				console.error(`Expected icons list to include:`, list);
			}
			expect(list.size).toBe(0);
		};

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

		//
		// Search for 'alert'
		//
		let icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			'alert'
		);
		expect(icons.length).toBe(4);

		// Make sure only icons that include 'alert' are in list
		testIconsList(
			icons,
			new Set([
				'alert', // hidden, exact match
				'alert-16',
				'alert-24',
				'alert-fill-12',
			])
		);

		// Check suffixes
		testFilters('suffixes', new Set(['12', '16', '24']));

		//
		// Aliases
		//
		icons = filterIconSetUniqueIconsByKeyword(
			iconSet.icons.unique,
			filters,
			'clippy'
		);
		expect(icons.length).toBe(3);

		// Make sure icons list includes only hidden icon
		testIconsList(icons, new Set(['clippy-16', 'clippy-24', 'clippy']));

		// Check suffixes
		testFilters('suffixes', new Set(['16', '24']));
	});
});
