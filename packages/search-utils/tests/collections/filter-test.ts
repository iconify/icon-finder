/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyInfo } from '@iconify/types';
import { promises as fs } from 'fs';
import { convertCollectionsList } from '../../lib/data/collections/convert/list';
import { applyCollectionsListFilter } from '../../lib/data/collections/filter/apply';
import type { IconFinderCollectionsList } from '../../lib/data/collections/types/collections';
import { fixturesDirectory } from '../../lib/tests/helpers';

describe('Testing applyCollectionsListFilter', () => {
	// Storage for data, loaded from fixtures
	let data: Record<string, IconifyInfo>;
	beforeAll(async () => {
		data = JSON.parse(
			await fs.readFile(
				fixturesDirectory + 'collections/all.json',
				'utf8'
			)
		) as Record<string, IconifyInfo>;
	});

	// Get collections by prefixes
	function getCollections(prefixes: string[]): IconFinderCollectionsList {
		const source = Object.create(null) as Record<string, IconifyInfo>;
		prefixes.forEach((prefix) => {
			if (!data[prefix]) {
				throw new Error(`Cannot find data for "${prefix}"`);
			}
			source[prefix] = data[prefix];
		});

		return convertCollectionsList(source)!;
	}

	// Get list of visible prefixes
	function getVisibleCollections(list: IconFinderCollectionsList): string[] {
		return Object.keys(list.prefixed).filter(
			(prefix) => !list.prefixed[prefix].filtered
		);
	}

	test('Filter by prefix', () => {
		const collections = getCollections([
			'mdi',
			'mdi-light',
			'ic',
			'twemoji',
		]);

		expect(getVisibleCollections(collections)).toEqual([
			'mdi',
			'mdi-light',
			'ic',
			'twemoji',
		]);

		// Empty list: 2 categories, 4 icon sets
		expect(collections.visible).toBe(4);
		expect(collections.total).toBe(4);

		expect(Object.keys(collections.categorised)).toEqual([
			'General',
			'Emoji',
		]);
		const generalCategory = collections.categorised['General'];
		const emojiCategory = collections.categorised['Emoji'];

		expect(generalCategory.visible).toBe(3);
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(emojiCategory.visible).toBe(1);
		expect(emojiCategory.filter.disabled).toBeFalsy();

		// Filter by prefix
		collections.search = 'mdi';
		applyCollectionsListFilter(collections);

		expect(getVisibleCollections(collections)).toEqual([
			'mdi',
			'mdi-light',
		]);

		expect(collections.visible).toBe(2);
		expect(collections.total).toBe(4);

		expect(generalCategory.visible).toBe(2);
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(emojiCategory.visible).toBe(0);
		expect(emojiCategory.filter.disabled).toBeTruthy();

		// Emoji!
		collections.search = 'moji';
		applyCollectionsListFilter(collections);
		expect(collections.visible).toBe(1);
		expect(collections.total).toBe(4);

		expect(generalCategory.visible).toBe(0);
		expect(generalCategory.filter.disabled).toBeTruthy();

		expect(emojiCategory.visible).toBe(1);
		expect(emojiCategory.filter.disabled).toBeFalsy();
	});

	test('Filter by name, hidden icon sets', () => {
		const collections = getCollections([
			'mdi',
			'geo',
			// Hidden
			'whh',
			'si-glyph',
		]);

		expect(getVisibleCollections(collections)).toEqual(['mdi', 'geo']);

		// Empty list: 2 categories, 2 visible icon sets
		expect(collections.visible).toBe(2);
		expect(collections.total).toBe(4);

		expect(Object.keys(collections.categorised)).toEqual([
			// mdi
			'General',
			// geo
			'Maps / Flags',
			// whh, si-glyph
			'',
		]);
		const generalCategory = collections.categorised['General'];
		const mapsCategory = collections.categorised['Maps / Flags'];
		const emptyCategory = collections.categorised[''];

		expect(generalCategory.visible).toBe(1);
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(mapsCategory.visible).toBe(1);
		expect(mapsCategory.filter.disabled).toBeFalsy();

		expect(emptyCategory.visible).toBe(0);
		expect(emptyCategory.filter.disabled).toBeTruthy();

		// Filter by prefix
		collections.search = 'glyph';
		applyCollectionsListFilter(collections);

		expect(getVisibleCollections(collections)).toEqual(['geo']);

		expect(collections.visible).toBe(1);
		expect(collections.total).toBe(4);

		expect(generalCategory.visible).toBe(0);
		expect(generalCategory.filter.disabled).toBeTruthy();

		expect(mapsCategory.visible).toBe(1);
		expect(mapsCategory.filter.disabled).toBeFalsy();

		expect(emptyCategory.visible).toBe(0);
		expect(emptyCategory.filter.disabled).toBeTruthy();
	});

	test('Mixed filters', () => {
		const collections = getCollections([
			// Apache, 'icons', 24
			'ic',
			'mdi',
			// MIT, author match for 'icons', 24
			'ph',
			// MIT, 'icon', 24
			'ri',
			// MIT, 'icons', 16
			'bi',
			// MIT, 'icons', 24
			'tabler',

			// Category: Brands
			// CC, 'icons', 24
			'bxl',
			'simple-icons',
			// CC, 32
			'fa6-brands',

			// Category: Maps
			// CC, 'icons', 50
			'map',
			// MIT
			'geo',
		]);

		// Empty list: 3 categories, 11 visible icon sets
		expect(collections.visible).toBe(11);
		expect(collections.total).toBe(11);

		expect(Object.keys(collections.categorised)).toEqual([
			'General',
			'Brands / Social',
			'Maps / Flags',
		]);
		const generalCategory = collections.categorised['General'];
		const brandsCategory = collections.categorised['Brands / Social'];
		const mapsCategory = collections.categorised['Maps / Flags'];

		expect(generalCategory.visible).toBe(6);
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(brandsCategory.visible).toBe(3);
		expect(brandsCategory.filter.disabled).toBeFalsy();

		expect(mapsCategory.visible).toBe(2);
		expect(mapsCategory.filter.disabled).toBeFalsy();

		// MIT and 'icons'
		collections.search = 'icons MIT';
		applyCollectionsListFilter(collections);

		expect(getVisibleCollections(collections)).toEqual([
			'ph',
			'bi',
			'tabler',
		]);

		expect(collections.visible).toBe(3);
		expect(collections.total).toBe(11);

		expect(generalCategory.visible).toBe(3); // 'ph', 'bi', 'tabler'
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(brandsCategory.visible).toBe(0);
		expect(brandsCategory.filter.disabled).toBeTruthy();

		expect(mapsCategory.visible).toBe(0);
		expect(mapsCategory.filter.disabled).toBeTruthy();

		// Apache and 'icon'
		collections.search = 'apache icon';
		applyCollectionsListFilter(collections);

		expect(getVisibleCollections(collections)).toEqual(['ic', 'mdi', 'ri']);

		expect(collections.visible).toBe(3);
		expect(collections.total).toBe(11);

		expect(generalCategory.visible).toBe(3);
		expect(generalCategory.filter.disabled).toBeFalsy();

		expect(brandsCategory.visible).toBe(0);
		expect(brandsCategory.filter.disabled).toBeTruthy();

		expect(mapsCategory.visible).toBe(0);
		expect(mapsCategory.filter.disabled).toBeTruthy();

		// CC and 24
		collections.search = '24 cc';
		applyCollectionsListFilter(collections);

		expect(getVisibleCollections(collections)).toEqual([
			'bxl',
			'simple-icons',
		]);

		expect(collections.visible).toBe(2);
		expect(collections.total).toBe(11);

		expect(generalCategory.visible).toBe(0);
		expect(generalCategory.filter.disabled).toBeTruthy();

		expect(brandsCategory.visible).toBe(2);
		expect(brandsCategory.filter.disabled).toBeFalsy();

		expect(mapsCategory.visible).toBe(0);
		expect(mapsCategory.filter.disabled).toBeTruthy();
	});
});
