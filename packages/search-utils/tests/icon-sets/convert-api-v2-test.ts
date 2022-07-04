/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { convertAPIv2IconSet } from '../../lib/icon-set/convert/api-v2';
import type { APIv2CollectionResponse } from '../../lib/api/types/v2';
import type { IconFinderIconSetUniqueIcon } from '../../lib/icon-set/types/icons';
import type { IconFinderIconSetCategory } from '../../lib/icon-set/types/category';
import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeItem,
} from '../../lib/icon-set/types/themes';

describe('Convert icon set from API', () => {
	it('Missing info', async () => {
		const data = JSON.parse(
			await loadFixture('api-v2/line-md.json')
		) as APIv2CollectionResponse;

		// Delete info
		delete data.info;

		const iconSet = convertAPIv2IconSet('', data);
		expect(iconSet).toBeNull();
	});

	it('line-md', async () => {
		const data = JSON.parse(
			await loadFixture('api-v2/line-md.json')
		) as APIv2CollectionResponse;

		const iconSet = convertAPIv2IconSet('', data);
		expect(iconSet).toBeTruthy();

		const total = 310;

		expect(iconSet!.source).toBe('api');
		expect(iconSet!.provider).toBe('');
		expect(iconSet!.prefix).toBe('line-md');
		expect(iconSet!.total).toBe(total);
		expect(iconSet!.info).toEqual({
			name: 'Material Line Icons',
			total,
			version: '0.2.0',
			author: {
				name: 'Vjacheslav Trushkin',
				url: 'https://github.com/cyberalien/line-md',
			},
			license: {
				title: 'MIT',
				spdx: 'MIT',
				url: 'https://github.com/cyberalien/line-md/blob/master/license.txt',
			},
			samples: [
				'loading-twotone-loop',
				'beer-alt-twotone-loop',
				'image-twotone',
			],
			height: 24,
			category: 'Animated Icons',
			palette: false,
		});

		// Icons
		const { map } = iconSet!.icons;

		const accountCategory: IconFinderIconSetCategory = {
			title: 'Account',
			color: 0,
		};
		expect(iconSet!.categories![0]).toEqual(accountCategory);

		const foodCategory: IconFinderIconSetCategory = {
			title: 'Food and Drink',
			color: 7,
		};
		expect(iconSet!.categories![7]).toEqual(foodCategory);

		// account
		const accountIcon = map['account'];
		const expectedAccountIcon: IconFinderIconSetUniqueIcon = {
			icons: [
				{
					name: 'account',
					categories: [accountCategory],
				},
			],
			render: 'account',
			categories: [accountCategory],
		};
		expect(accountIcon).toEqual(expectedAccountIcon);

		// beer-filled + alias
		const beerFilledIcon = map['beer-filled'];
		const expectedBeerFilledIcon: IconFinderIconSetUniqueIcon = {
			icons: [
				{
					name: 'beer-filled',
					categories: [foodCategory],
				},
				{
					name: 'beer-solid',
					categories: [foodCategory],
				},
			],
			render: 'beer-filled',
			categories: [foodCategory],
		};
		expect(beerFilledIcon).toEqual(expectedBeerFilledIcon);

		expect(map['beer-solid']).toBe(map['beer-filled']);

		// Suffixes
		const emptySuffix: IconFinderIconSetThemeItem = {
			title: 'Outline Animation',
			match: '',
			color: 0,
		};
		const otherSuffixes: IconFinderIconSetThemeItem[] = [
			{
				title: 'Erase Animation',
				match: '-out',
				color: 1,
			},
			{
				title: 'Looping Animation',
				match: '-loop',
				color: 2,
			},
			{
				title: 'Transition Between Icons',
				match: '-transition',
				color: 3,
			},
		];
		const expectedIconSetSuffixes: IconFinderIconSetTheme = {
			type: 'suffixes',
			// Same order as in JSON file
			items: [emptySuffix, ...otherSuffixes],
			// Longest matches first
			sorted: [otherSuffixes[2], otherSuffixes[1], otherSuffixes[0]],
			empty: emptySuffix,
		};
		expect(iconSet!.suffixes).toEqual(expectedIconSetSuffixes);
	});
});
