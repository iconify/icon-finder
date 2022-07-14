/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import type { IconFinderTagsFilter } from '../../lib/filters/types/filter';
import { convertRawIconSet } from '../../lib/icon-set/convert/raw';

describe('Testing tags', () => {
	it('Simple icon set with one tag per icon', () => {
		const prefix = 'foo';
		const raw: IconifyJSON = {
			prefix,
			info: {
				name: 'Test',
				author: {
					name: 'Unknown',
				},
				license: {
					title: 'MIT',
				},
			},
			icons: {
				'home-solid': {
					body: '<g />',
				},
				'home-outline': {
					body: '<g />',
				},
				'home-twotone': {
					body: '<g fill-opacity="0.3" />',
				},
				'account-solid': {
					body: '<g id="account-solid" />',
				},
				'account-outline': {
					body: '<g id="account-outline" />',
				},
				'account-twotone': {
					body: '<g id="account" fill-opacity="0.3" />',
				},
				'whatever': {
					body: '<g id="icon-without-valid-suffix" />',
				},
			},
			aliases: {
				'house-solid': {
					parent: 'home-solid',
				},
			},
			categories: {
				Home: ['home-solid', 'home-outline', 'home-twotone'],
				Account: [
					'account-solid',
					'account-outline',
					'account-twotone',
				],
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		// Prefixes and suffixes should be empty
		const filters = iconSet!.filters;
		expect(filters.prefixes).toBeUndefined();
		expect(filters.suffixes).toBeUndefined();

		// Check tags
		const tags = filters.tags!;
		const expectedTags: IconFinderTagsFilter[] = [
			{
				key: 'tagsHome',
				title: 'Home',
				color: 0,
			},
			{
				key: 'tagsAccount',
				title: 'Account',
				color: 1,
			},
			{
				key: 'tags',
				title: '',
				color: 2,
			},
		];
		expect(tags.filters).toEqual(expectedTags);

		const [homeTag, accountTag, emptyTag] = tags.filters;

		// Check tags in icons
		const { iconsMap } = iconSet!.icons;

		const homeSolidIcon = iconsMap.get('home-solid')!;
		expect(homeSolidIcon.tags).toEqual([homeTag]);
		expect(homeSolidIcon.tags![0]).toBe(homeTag);

		const accountOutlineIcon = iconsMap.get('account-outline')!;
		expect(accountOutlineIcon.tags).toEqual([accountTag]);
		expect(accountOutlineIcon.tags![0]).toBe(accountTag);

		const whateverIcon = iconsMap.get('whatever')!;
		expect(whateverIcon.tags).toEqual([emptyTag]);
		expect(whateverIcon.tags![0]).toBe(emptyTag);
	});

	it('Aliases', () => {
		const prefix = 'foo';
		const raw: IconifyJSON = {
			prefix,
			info: {
				name: 'Test',
				author: {
					name: 'Unknown',
				},
				license: {
					title: 'MIT',
				},
			},
			icons: {
				'arrow-left': {
					body: '<g id="arrow" />',
				},
				'toyota': {
					body: '<g id="car" class="toyota" />',
				},
				'subaru': {
					body: '<g id="car" class="subaru" />',
				},
				'opel': {
					body: '<g id="car" class="opel" />',
				},
			},
			aliases: {
				'arrow-right': {
					parent: 'arrow-left',
					hFlip: true,
				},
				'arrow-up': {
					parent: 'arrow-left',
					rotate: 1,
				},
				'arrow-down': {
					parent: 'arrow-left',
					rotate: 3,
				},
				'vauxhall': {
					parent: 'opel',
				},
			},
			categories: {
				'Arrows': ['arrow-left'],
				'Cars': ['toyota', 'subaru', 'opel', 'vauxhall'],
				'LHD Only Cars': ['opel'],
				'RHD Only Cars': ['vauxhall'],
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		const filters = iconSet!.filters;

		// Check tags
		const tags = filters.tags!;
		const expectedTags: IconFinderTagsFilter[] = [
			{
				key: 'tagsArrows',
				title: 'Arrows',
				color: 0,
			},
			{
				key: 'tagsCars',
				title: 'Cars',
				color: 1,
			},
			{
				key: 'tagsLHD Only Cars',
				title: 'LHD Only Cars',
				color: 2,
			},
			{
				key: 'tagsRHD Only Cars',
				title: 'RHD Only Cars',
				color: 3,
			},
		];
		expect(tags.filters).toEqual(expectedTags);

		const [arrowsTag, carsTag, lhdCarsTag, rhdCarsTag] = tags.filters;

		// Check tags in icons
		const { iconsMap, uniqueMap } = iconSet!.icons;

		const arrowLeftIcon = iconsMap.get('arrow-left')!;
		expect(arrowLeftIcon.tags).toEqual([arrowsTag]);
		expect(arrowLeftIcon.tags![0]).toBe(arrowsTag);

		// Alias with transformation
		const arrowRightIcon = iconsMap.get('arrow-right')!;
		expect(arrowRightIcon.tags).toEqual([arrowsTag]);

		// Simple icon
		const subaruIcon = iconsMap.get('subaru')!;
		expect(subaruIcon.tags).toEqual([carsTag]);

		// Icon with multiple entries: check unique icon
		const uniqueOpelIcon = uniqueMap.get('opel')!;
		expect(uniqueOpelIcon.icons[0]).toEqual({
			name: 'opel',
			tags: [
				// only tags for 'opel'
				carsTag,
				lhdCarsTag,
			],
		});
		expect(uniqueOpelIcon.icons[1]).toEqual({
			name: 'vauxhall',
			tags: [
				// only tags for 'vauxhall'
				carsTag,
				rhdCarsTag,
			],
		});

		// Alias with custom tags
		const uniqueVauxhallIcon = uniqueMap.get('vauxhall');
		expect(uniqueVauxhallIcon).toBe(uniqueOpelIcon);
	});
});
