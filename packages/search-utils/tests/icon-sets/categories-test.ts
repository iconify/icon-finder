/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import { convertRawIconSet } from '../../lib/icon-set/convert/raw';
import type { IconFinderIconSetCategory } from '../../lib/icon-set/types/category';

describe('Testing categories', () => {
	it('Simple icon set with one category per icon', () => {
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
		expect(iconSet?.prefixes).toBeUndefined();
		expect(iconSet?.suffixes).toBeUndefined();

		// Check categories
		const categories = iconSet!.categories!;
		const expectedCategories: IconFinderIconSetCategory[] = [
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
		expect(categories).toEqual(expectedCategories);

		const [homeCategory, accountCategory, emptyCategory] = categories;

		// Check categories in icons
		const { map } = iconSet!.icons;

		const homeSolidIcon = map['home-solid'];
		expect(homeSolidIcon.categories).toEqual([homeCategory]);
		expect(homeSolidIcon.categories![0]).toBe(homeCategory);
		expect(homeSolidIcon.icons[0].categories).toEqual([homeCategory]);
		expect(homeSolidIcon.icons[0].categories![0]).toBe(homeCategory);

		const accountOutlineIcon = map['account-outline'];
		expect(accountOutlineIcon.categories).toEqual([accountCategory]);
		expect(accountOutlineIcon.categories![0]).toBe(accountCategory);
		expect(accountOutlineIcon.icons[0].categories).toEqual([
			accountCategory,
		]);
		expect(accountOutlineIcon.icons[0].categories![0]).toBe(
			accountCategory
		);

		const whateverIcon = map['whatever'];
		expect(whateverIcon.categories).toEqual([emptyCategory]);
		expect(whateverIcon.categories![0]).toBe(emptyCategory);
		expect(whateverIcon.icons[0].categories).toEqual([emptyCategory]);
		expect(whateverIcon.icons[0].categories![0]).toBe(emptyCategory);
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

		// Check categories
		const categories = iconSet!.categories!;
		const expectedCategories: IconFinderIconSetCategory[] = [
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
		expect(categories).toEqual(expectedCategories);

		const [arrowsCategory, carsCategory, lhdCarsCategory, rhdCarsCategory] =
			categories;

		// Check categories in icons
		const { map } = iconSet!.icons;

		const arrowLeftIcon = map['arrow-left'];
		expect(arrowLeftIcon.categories).toEqual([arrowsCategory]);
		expect(arrowLeftIcon.categories![0]).toBe(arrowsCategory);
		expect(arrowLeftIcon.icons[0].categories).toEqual([arrowsCategory]);
		expect(arrowLeftIcon.icons[0].categories![0]).toBe(arrowsCategory);

		// Alias with transformation
		const arrowRightIcon = map['arrow-right'];
		expect(arrowRightIcon.categories).toEqual([arrowsCategory]);
		expect(arrowRightIcon.icons[0].categories).toEqual([arrowsCategory]);

		// Simple icon
		const subaruIcon = map['subaru'];
		expect(subaruIcon.categories).toEqual([carsCategory]);
		expect(subaruIcon.icons[0].categories).toEqual([carsCategory]);

		// Icon with multiple entries
		const opelIcon = map['opel'];
		expect(opelIcon.categories).toEqual([
			// unique icon should contain categories from both 'opel' and 'vauxhall'
			carsCategory,
			rhdCarsCategory,
			lhdCarsCategory,
		]);
		expect(opelIcon.icons[0]).toEqual({
			name: 'opel',
			categories: [
				// only categories for 'opel'
				carsCategory,
				lhdCarsCategory,
			],
		});
		expect(opelIcon.icons[1]).toEqual({
			name: 'vauxhall',
			categories: [
				// only categories for 'vauxhall'
				carsCategory,
				rhdCarsCategory,
			],
		});
		expect(opelIcon.render).toBe('opel');

		// Alias with custom categories
		const vauxhallIcon = map['vauxhall'];
		expect(vauxhallIcon).toBe(opelIcon);
	});
});
