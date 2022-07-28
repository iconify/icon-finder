/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { convertAPIv2IconSet } from '../../lib/data/icon-set/convert/api-v2';
import type { APIv2CollectionResponse } from '../../lib/data/api-types/v2';
import type { IconFinderIconSetUniqueIcon } from '../../lib/data/icon-set/types/icons';
import type {
	IconFinderTagsFilter,
	IconFinderThemeFilter,
} from '../../lib/data/filters/types/filter';
import type { IconFinderThemeFiltersList } from '../../lib/data/filters/types/list';

describe('Convert icon set from API', () => {
	it('Missing info', async () => {
		const data = JSON.parse(
			await loadFixture('api-v2/line-md.json')
		) as APIv2CollectionResponse;

		// Delete info
		delete data.info;

		const iconSet = convertAPIv2IconSet('', data);
		expect(iconSet).toBeUndefined();
	});

	it('line-md', async () => {
		const data = JSON.parse(
			await loadFixture('api-v2/line-md.json')
		) as APIv2CollectionResponse;

		const iconSet = convertAPIv2IconSet('', data);
		expect(iconSet).toBeTruthy();

		const total = 310;

		expect(iconSet!.source).toBe('api');
		expect(iconSet!.id).toEqual({
			provider: '',
			prefix: 'line-md',
		});
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

		// Expand icons list and filters
		const { uniqueMap, iconsMap } = iconSet!.icons;
		const { tags, suffixes } = iconSet!.filters;

		// Suffixes
		const emptySuffix: IconFinderThemeFilter = {
			key: 'suffixes',
			title: 'Outline Animation',
			match: '',
			color: 0,
		};
		const outSuffix: IconFinderThemeFilter = {
			key: 'suffixes-out',
			title: 'Erase Animation',
			match: '-out',
			color: 1,
		};
		const loopSuffix: IconFinderThemeFilter = {
			key: 'suffixes-loop',
			title: 'Looping Animation',
			match: '-loop',
			color: 2,
		};
		const transitionSuffix: IconFinderThemeFilter = {
			key: 'suffixes-transition',
			title: 'Transition Between Icons',
			match: '-transition',
			color: 3,
		};

		const expectedIconSetSuffixes: IconFinderThemeFiltersList = {
			type: 'suffixes',
			visible: 4,

			// Same order as in JSON file
			filters: [emptySuffix, outSuffix, loopSuffix, transitionSuffix],

			// Longest matches first
			sorted: [transitionSuffix, loopSuffix, outSuffix],

			empty: emptySuffix,
		};
		expect(suffixes).toEqual(expectedIconSetSuffixes);

		// Icons and tags
		const accountTag: IconFinderTagsFilter = {
			key: 'tagsAccount',
			title: 'Account',
			color: 0,
		};
		expect(tags!.filters[0]).toEqual(accountTag);

		const foodTag: IconFinderTagsFilter = {
			key: 'tagsFood and Drink',
			title: 'Food and Drink',
			color: 7,
		};
		expect(tags!.filters[7]).toEqual(foodTag);

		const socialTag: IconFinderTagsFilter = {
			key: 'tagsSocial',
			title: 'Social',
			color: 10,
		};
		expect(tags!.filters[10]).toEqual(socialTag);

		// account
		const accountIcon = uniqueMap.get('account');
		const accountIconItem = iconsMap.get('account');
		const expectedAccountIcon: IconFinderIconSetUniqueIcon = {
			icons: [
				{
					name: 'account',
					tags: [accountTag],
					suffix: emptySuffix,
				},
			],
		};
		expect(accountIcon).toEqual(expectedAccountIcon);
		expect(accountIcon!.icons[0]).toBe(accountIconItem);

		// beer-filled + alias
		const beerFilledIcon = uniqueMap.get('beer-filled');
		const beerFilledIconItem = iconsMap.get('beer-filled');
		const beerSolidIconItem = iconsMap.get('beer-solid');
		const expectedBeerFilledIcon: IconFinderIconSetUniqueIcon = {
			icons: [
				{
					name: 'beer-filled',
					tags: [foodTag],
					suffix: emptySuffix,
				},
				{
					name: 'beer-solid',
					tags: [foodTag],
					suffix: emptySuffix,
				},
			],
		};
		expect(beerFilledIcon).toEqual(expectedBeerFilledIcon);
		expect(uniqueMap.get('beer-solid')).toBe(beerFilledIcon);
		expect(beerFilledIcon!.icons[0]).toBe(beerFilledIconItem);
		expect(beerFilledIcon!.icons[1]).toBe(beerSolidIconItem);

		// github-loop to check suffix
		const githubLoopIcon = uniqueMap.get('github-loop');
		const expectedGithubLoopIcon: IconFinderIconSetUniqueIcon = {
			icons: [
				{
					name: 'github-loop',
					tags: [socialTag],
					suffix: loopSuffix,
				},
			],
		};
		expect(githubLoopIcon).toEqual(expectedGithubLoopIcon);

		// Pagination should be empty
		expect(iconSet!.pagination).toEqual({});
	});
});
