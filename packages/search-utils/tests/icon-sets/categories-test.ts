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
				title: 'Home',
				color: 0,
			},
			{
				title: 'Account',
				color: 1,
			},
			{
				title: '',
				color: 2,
			},
		];
		expect(tags.filters).toEqual(expectedTags);

		const [homeTag, accountTag, emptyTag] = tags.filters;

		// Check tags in icons
		const { map } = iconSet!.icons;

		const homeSolidIcon = map['home-solid'];
		expect(homeSolidIcon.tags).toEqual([homeTag]);
		expect(homeSolidIcon.tags![0]).toBe(homeTag);
		expect(homeSolidIcon.icons[0].tags).toEqual([homeTag]);
		expect(homeSolidIcon.icons[0].tags![0]).toBe(homeTag);

		const accountOutlineIcon = map['account-outline'];
		expect(accountOutlineIcon.tags).toEqual([accountTag]);
		expect(accountOutlineIcon.tags![0]).toBe(accountTag);
		expect(accountOutlineIcon.icons[0].tags).toEqual([accountTag]);
		expect(accountOutlineIcon.icons[0].tags![0]).toBe(accountTag);

		const whateverIcon = map['whatever'];
		expect(whateverIcon.tags).toEqual([emptyTag]);
		expect(whateverIcon.tags![0]).toBe(emptyTag);
		expect(whateverIcon.icons[0].tags).toEqual([emptyTag]);
		expect(whateverIcon.icons[0].tags![0]).toBe(emptyTag);
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
				title: 'Arrows',
				color: 0,
			},
			{
				title: 'Cars',
				color: 1,
			},
			{
				title: 'LHD Only Cars',
				color: 2,
			},
			{
				title: 'RHD Only Cars',
				color: 3,
			},
		];
		expect(tags.filters).toEqual(expectedTags);

		const [arrowsTag, carsTag, lhdCarsTag, rhdCarsTag] = tags.filters;

		// Check tags in icons
		const { map } = iconSet!.icons;

		const arrowLeftIcon = map['arrow-left'];
		expect(arrowLeftIcon.tags).toEqual([arrowsTag]);
		expect(arrowLeftIcon.tags![0]).toBe(arrowsTag);
		expect(arrowLeftIcon.icons[0].tags).toEqual([arrowsTag]);
		expect(arrowLeftIcon.icons[0].tags![0]).toBe(arrowsTag);

		// Alias with transformation
		const arrowRightIcon = map['arrow-right'];
		expect(arrowRightIcon.tags).toEqual([arrowsTag]);
		expect(arrowRightIcon.icons[0].tags).toEqual([arrowsTag]);

		// Simple icon
		const subaruIcon = map['subaru'];
		expect(subaruIcon.tags).toEqual([carsTag]);
		expect(subaruIcon.icons[0].tags).toEqual([carsTag]);

		// Icon with multiple entries
		const opelIcon = map['opel'];
		expect(opelIcon.tags).toEqual([
			// unique icon should contain tags from both 'opel' and 'vauxhall'
			carsTag,
			rhdCarsTag,
			lhdCarsTag,
		]);
		expect(opelIcon.icons[0]).toEqual({
			name: 'opel',
			tags: [
				// only tags for 'opel'
				carsTag,
				lhdCarsTag,
			],
		});
		expect(opelIcon.icons[1]).toEqual({
			name: 'vauxhall',
			tags: [
				// only tags for 'vauxhall'
				carsTag,
				rhdCarsTag,
			],
		});

		// Alias with custom tags
		const vauxhallIcon = map['vauxhall'];
		expect(vauxhallIcon).toBe(opelIcon);
	});
});
