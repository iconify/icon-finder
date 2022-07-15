/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyInfo } from '@iconify/types';
import { promises as fs } from 'fs';
import { convertCollectionsList } from '../../lib/data/collections/convert/list';
import type { IconFinderCollectionsListItem } from '../../lib/data/collections/types/collections';
import type { IconFinderCategoriesFiltersList } from '../../lib/data/filters/types/list';
import type { IconFinderCategoriesFilter } from '../../lib/data/filters/types/filter';
import { generateSearchData } from '../../lib/data/collections/convert/search';

describe('Testing convertCollectionsList', () => {
	function categoriesToBaseFilters(
		titles: string[]
	): IconFinderCategoriesFiltersList {
		const filters = titles.map((title, index) => {
			const result: IconFinderCategoriesFilter = {
				key: 'category-' + title,
				title,
				color: index,
				disabled: false,
			};
			return result;
		});
		return {
			type: 'categories',
			filters,
			visible: titles.length,
		};
	}

	const mdi: IconifyInfo = {
		name: 'Material Design Icons',
		total: 6689,
		author: {
			name: 'Austin Andrews',
			url: 'https://github.com/Templarian/MaterialDesign',
		},
		license: {
			title: 'Apache 2.0',
			spdx: 'Apache-2.0',
			url: 'https://github.com/Templarian/MaterialDesign/blob/master/LICENSE',
		},
		samples: ['account-check', 'bell-alert-outline', 'calendar-edit'],
		height: 24,
		category: 'General',
		palette: false,
	};
	const mdiSerialised = JSON.stringify(mdi);

	test('Simple list, one category', () => {
		const ph: IconifyInfo = {
			name: 'Phosphor',
			total: 6282,
			version: '1.4.2',
			author: {
				name: 'Phosphor Icons',
				url: 'https://github.com/phosphor-icons/phosphor-icons',
			},
			license: {
				title: 'MIT',
				spdx: 'MIT',
				url: 'https://github.com/phosphor-icons/phosphor-icons/blob/master/LICENSE',
			},
			samples: [
				'folder-notch-open-duotone',
				'check-square-offset-thin',
				'pencil-line-fill',
			],
			height: 24,
			category: 'General',
			palette: false,
		};
		const source: Record<string, IconifyInfo> = {
			mdi,
			ph,
		};

		const result = convertCollectionsList(source);

		// Make sure source was not modified
		expect(mdi).toEqual(JSON.parse(mdiSerialised));

		// State and counters
		expect(result.search).toBe('');
		expect(result.total).toBe(2);
		expect(result.visible).toBe(2);

		// Test categories
		expect(Object.keys(result.categorised)).toEqual(['General']);

		const generalCategory = result.categorised['General'];
		expect(generalCategory.title).toBe('General');
		expect(generalCategory.items.length).toBe(2);
		expect(generalCategory.visible).toBe(2);

		// Test prefixes
		expect(Object.keys(result.prefixed)).toEqual(['mdi', 'ph']);

		// Test filters
		const expectedGeneralFilters: IconFinderCategoriesFiltersList = {
			...categoriesToBaseFilters(['General']),
			visible: 1,
		};
		expect(result.filters.categories).toEqual(expectedGeneralFilters);

		// Test lists
		expect(generalCategory.items.length).toBe(2);
		const mdiListItem = generalCategory.items[0];
		const phListItem = generalCategory.items[1];

		expect(mdiListItem).toBe(result.prefixed['mdi']);
		expect(phListItem).toBe(result.prefixed['ph']);

		// Test info
		const expectedMDI: IconFinderCollectionsListItem = {
			prefix: 'mdi',
			title: 'Material Design Icons',
			info: mdi,
			category: 'General',
			filtered: false,
			color: 0,
			searchData: generateSearchData('mdi', mdi),
		};
		expect(mdiListItem).toEqual(expectedMDI);

		const expectedPH: IconFinderCollectionsListItem = {
			prefix: 'ph',
			title: 'Phosphor',
			info: ph,
			category: 'General',
			filtered: false,
			color: 1,
			searchData: generateSearchData('ph', ph),
		};
		expect(phListItem).toEqual(expectedPH);
	});

	test('Multiple categories', () => {
		const source: Record<string, IconifyInfo> = {
			mdi,
			openmoji: {
				name: 'OpenMoji',
				total: 3944,
				author: {
					name: 'OpenMoji',
					url: 'https://github.com/hfg-gmuend/openmoji',
				},
				license: {
					title: 'CC BY-SA 4.0',
					spdx: 'CC-BY-SA-4.0',
					url: 'https://creativecommons.org/licenses/by-sa/4.0/',
				},
				samples: ['bicycle', 'bow-and-arrow', 'full-moon-face'],
				height: 18,
				category: 'Emoji',
				palette: true,
			},
			twemoji: {
				name: 'Twitter Emoji',
				total: 3556,
				author: {
					name: 'Twitter',
					url: 'https://github.com/twitter/twemoji',
				},
				license: {
					title: 'CC BY 4.0',
					spdx: 'CC-BY-4.0',
					url: 'https://creativecommons.org/licenses/by/4.0/',
				},
				samples: ['anguished-face', 'duck', 'crossed-swords'],
				height: 36,
				displayHeight: 18,
				category: 'Emoji',
				palette: true,
			},
		};
		const result = convertCollectionsList(source);

		// Make sure source was not modified
		expect(mdi).toEqual(JSON.parse(mdiSerialised));

		// State and counters
		expect(result.search).toBe('');
		expect(result.total).toBe(3);
		expect(result.visible).toBe(3);

		// Test categories
		expect(Object.keys(result.categorised)).toEqual(['General', 'Emoji']);

		const generalCategory = result.categorised['General'];
		expect(generalCategory.title).toBe('General');
		expect(generalCategory.items.length).toBe(1);
		expect(generalCategory.visible).toBe(1);

		const emojiCategory = result.categorised['Emoji'];
		expect(emojiCategory.title).toBe('Emoji');
		expect(emojiCategory.items.length).toBe(2);
		expect(emojiCategory.visible).toBe(2);

		// Test prefixes
		expect(Object.keys(result.prefixed)).toEqual([
			'mdi',
			'openmoji',
			'twemoji',
		]);

		// Test filters
		const categoriesFilters = result.filters.categories!;
		expect(categoriesFilters).toEqual(
			categoriesToBaseFilters(['General', 'Emoji'])
		);
		expect(categoriesFilters.visible).toBe(2);
		expect(categoriesFilters.selected).toBeFalsy();
	});

	test('Hidden icon set without category', () => {
		const source: Record<string, IconifyInfo> = {
			mdi,
			vaadin: {
				name: 'Vaadin Icons',
				total: 636,
				version: '4.3.2',
				author: {
					name: 'Vaadin',
					url: 'https://github.com/vaadin/web-components',
				},
				license: {
					title: 'Apache 2.0',
					spdx: 'Apache-2.0',
				},
				samples: ['area-select', 'file-picture', 'plus-circle-o'],
				height: 32,
				displayHeight: 16,
				palette: false,
				hidden: true,
			},
		};
		const result = convertCollectionsList(source);

		// Make sure source was not modified
		expect(mdi).toEqual(JSON.parse(mdiSerialised));

		// State and counters
		expect(result.search).toBe('');
		expect(result.total).toBe(2);
		expect(result.visible).toBe(1);

		// Test categories
		expect(Object.keys(result.categorised)).toEqual(['General', '']);

		const generalCategory = result.categorised['General'];
		expect(generalCategory.title).toBe('General');
		expect(generalCategory.items.length).toBe(1);
		expect(generalCategory.visible).toBe(1);

		const emptyCategory = result.categorised[''];
		expect(emptyCategory.title).toBe('');
		expect(emptyCategory.items.length).toBe(1);
		expect(emptyCategory.visible).toBe(0);

		// Test prefixes
		expect(Object.keys(result.prefixed)).toEqual(['mdi', 'vaadin']);

		// Get expected filters, empty category should be disabled
		const expectedFiltersList = categoriesToBaseFilters(['General', '']);
		expect(expectedFiltersList.filters.length).toBe(2);
		const emptyFilter = expectedFiltersList.filters[1];
		emptyFilter.disabled = emptyFilter.hiddenIfDisabled = true;

		expect(result.filters.categories).toEqual({
			...expectedFiltersList,
			visible: 1,
		});
	});

	test('Hidden icon set with category', () => {
		const source: Record<string, IconifyInfo> = {
			mdi,
			el: {
				name: 'Elusive Icons',
				total: 304,
				version: '2.0.0',
				author: {
					name: 'Team Redux',
					url: 'https://github.com/dovy/elusive-icons',
				},
				license: {
					title: 'Open Font License',
					spdx: 'OFL-1.1',
					url: 'https://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL',
				},
				samples: ['headphones', 'cog', 'user'],
				height: 16,
				category: 'Archive / Unmaintained',
				palette: false,
				hidden: true,
			},
		};
		const result = convertCollectionsList(source);

		// Make sure source was not modified
		expect(mdi).toEqual(JSON.parse(mdiSerialised));

		// State and counters
		expect(result.search).toBe('');
		expect(result.total).toBe(2);
		expect(result.visible).toBe(1);

		// Test categories
		expect(Object.keys(result.categorised)).toEqual([
			'General',
			'Archive / Unmaintained',
		]);

		const generalCategory = result.categorised['General'];
		expect(generalCategory.title).toBe('General');
		expect(generalCategory.items.length).toBe(1);
		expect(generalCategory.visible).toBe(1);

		const archiveCategory = result.categorised['Archive / Unmaintained'];
		expect(archiveCategory.title).toBe('Archive / Unmaintained');
		expect(archiveCategory.items.length).toBe(1);
		expect(archiveCategory.visible).toBe(0);

		// Test prefixes
		expect(Object.keys(result.prefixed)).toEqual(['mdi', 'el']);

		// Get expected filters, archive category should be disabled
		const expectedFiltersList = categoriesToBaseFilters([
			'General',
			'Archive / Unmaintained',
		]);
		expect(expectedFiltersList.filters.length).toBe(2);
		const archiveFilter = expectedFiltersList.filters[1];
		archiveFilter.disabled = archiveFilter.hiddenIfDisabled = true;

		expect(result.filters.categories).toEqual({
			...expectedFiltersList,
			visible: 1,
		});
	});

	test('collections.json', async () => {
		const source = JSON.parse(
			await fs.readFile('tests/fixtures/collections/all.json', 'utf8')
		) as Record<string, IconifyInfo>;
		const result = convertCollectionsList(source);

		// Test categories
		const expectedCategories: string[] = [
			'General',
			'Emoji',
			'Brands / Social',
			'Maps / Flags',
			'Thematic',
			'Archive / Unmaintained',
			'',
		];
		expect(Object.keys(result.categorised)).toEqual(expectedCategories);

		// Get expected filters, empty category should be disabled
		const expectedFiltersList = categoriesToBaseFilters(expectedCategories);
		expect(expectedFiltersList.filters.length).toBe(
			expectedCategories.length
		);
		const emptyFilter =
			expectedFiltersList.filters[expectedFiltersList.filters.length - 1];
		emptyFilter.disabled = emptyFilter.hiddenIfDisabled = true;

		expect(result.filters.categories).toEqual({
			...expectedFiltersList,
			visible: expectedFiltersList.filters.length - 1,
		});
	});
});
