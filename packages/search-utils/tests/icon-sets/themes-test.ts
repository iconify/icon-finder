/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import type { IconFinderThemeFilter } from '../../lib/filters/types/filter';
import type { IconFinderThemeFiltersList } from '../../lib/filters/types/list';
import { convertRawIconSet } from '../../lib/icon-set/convert/raw';
import { getBaseIconForTheme } from '../../lib/icon-set/themes/base';
import { getThemeVariations } from '../../lib/icon-set/themes/variations';

describe('Testing themes', () => {
	it('Suffixes', () => {
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
			suffixes: {
				solid: 'Solid',
				outline: 'Outline',
				twotone: 'Two-Tone',
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		// Prefixes and tags should be empty
		const filters = iconSet!.filters;
		expect(filters.prefixes).toBeUndefined();
		expect(filters.tags).toBeUndefined();

		// Check suffixes
		const suffixes = filters.suffixes!;
		const solidSuffix: IconFinderThemeFilter = {
			title: 'Solid',
			match: '-solid',
			color: 0,
		};
		const outlineSuffix: IconFinderThemeFilter = {
			title: 'Outline',
			match: '-outline',
			color: 1,
		};
		const twotoneSuffix: IconFinderThemeFilter = {
			title: 'Two-Tone',
			match: '-twotone',
			color: 2,
		};
		const expectedSuffixes: IconFinderThemeFiltersList = {
			type: 'suffixes',
			filters: [solidSuffix, outlineSuffix, twotoneSuffix],
			sorted: [outlineSuffix, twotoneSuffix, solidSuffix],
			visible: 3,
		};
		expect(suffixes).toEqual(expectedSuffixes);

		// Get actual items, make sure they are not clones
		const [actualSolidSuffix, actualOutlineSuffix, actualTwotoneSuffix] =
			suffixes.filters;
		expect(suffixes.sorted[0]).toBe(actualOutlineSuffix);
		expect(suffixes.sorted[1]).toBe(actualTwotoneSuffix);
		expect(suffixes.sorted[2]).toBe(actualSolidSuffix);

		// Check 'account' icon
		// Base name without suffix
		const baseAccount = getBaseIconForTheme('account-twotone', suffixes);
		expect(baseAccount).toEqual({
			name: 'account',
			filter: actualTwotoneSuffix,
		});
		expect(baseAccount!.filter).toBe(actualTwotoneSuffix);

		// Match suffixes
		const accountVariations = getThemeVariations(
			'account-twotone',
			suffixes
		);
		expect(accountVariations).toEqual([
			{
				name: 'account-solid',
				filter: actualSolidSuffix,
			},
			{
				name: 'account-outline',
				filter: actualOutlineSuffix,
			},
			{
				name: 'account-twotone',
				filter: actualTwotoneSuffix,
			},
		]);
		expect(accountVariations?.[0].filter).toBe(actualSolidSuffix);
		expect(accountVariations?.[1].filter).toBe(actualOutlineSuffix);
		expect(accountVariations?.[2].filter).toBe(actualTwotoneSuffix);

		// Check 'home' icon
		// Base name without suffix
		const baseHome = getBaseIconForTheme('home-solid', suffixes);
		expect(baseHome).toEqual({
			name: 'home',
			filter: actualSolidSuffix,
		});
		expect(baseHome!.filter).toBe(actualSolidSuffix);

		// Match suffixes
		const homeVariations = getThemeVariations(baseHome, suffixes);
		expect(homeVariations).toEqual([
			{
				name: 'home-solid',
				filter: actualSolidSuffix,
			},
			{
				name: 'home-outline',
				filter: actualOutlineSuffix,
			},
			{
				name: 'home-twotone',
				filter: actualTwotoneSuffix,
			},
		]);
		expect(getThemeVariations('home-outline', suffixes)).toEqual(
			homeVariations
		);
		expect(getThemeVariations('home-twotone', suffixes)).toEqual(
			homeVariations
		);
		expect(getThemeVariations('home', suffixes)).toBeUndefined();

		// Check 'whatever' icon
		// Base name without suffix
		const baseWhatever = getBaseIconForTheme('whatever', suffixes);
		expect(baseWhatever).toBeUndefined();

		// Match prefixes
		expect(getThemeVariations(baseWhatever, suffixes)).toBeUndefined();
		expect(getThemeVariations('whatever', suffixes)).toBeUndefined();
	});

	it('Prefixes with default value', () => {
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
				// No actual icons in this icon set, except for dummy icon to make sure it passes import
				whatever: {
					body: '<g />',
				},
			},
			prefixes: {
				'': 'Baseline',
				'outline': 'Outline',
				'round': 'Round',
				'twotone': 'Two-Tone',
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		// Suffixes and tags should be empty
		const filters = iconSet!.filters;
		expect(filters.suffixes).toBeUndefined();
		expect(filters.tags).toBeUndefined();

		// Check prefixes
		const prefixes = filters.prefixes!;
		const baselinePrefix: IconFinderThemeFilter = {
			title: 'Baseline',
			match: '',
			color: 0,
		};
		const outlinePrefix: IconFinderThemeFilter = {
			title: 'Outline',
			match: 'outline-',
			color: 1,
		};
		const roundPrefix: IconFinderThemeFilter = {
			title: 'Round',
			match: 'round-',
			color: 2,
		};
		const twotonePrefix: IconFinderThemeFilter = {
			title: 'Two-Tone',
			match: 'twotone-',
			color: 3,
		};
		const expectedPrefixes: IconFinderThemeFiltersList = {
			type: 'prefixes',
			filters: [
				baselinePrefix,
				outlinePrefix,
				roundPrefix,
				twotonePrefix,
			],
			sorted: [outlinePrefix, twotonePrefix, roundPrefix],
			empty: baselinePrefix,
			visible: 4,
		};
		expect(prefixes).toEqual(expectedPrefixes);

		// Get actual items, make sure they are not clones
		const [
			actualBaselinePrefix,
			actualOutlinePrefix,
			actualRoundPrefix,
			actualTwotonePrefix,
		] = prefixes.filters;
		expect(prefixes.sorted[0]).toBe(actualOutlinePrefix);
		expect(prefixes.sorted[1]).toBe(actualTwotonePrefix);
		expect(prefixes.sorted[2]).toBe(actualRoundPrefix);
		expect(prefixes.empty).toBe(actualBaselinePrefix);

		// Test 'home' icon
		// Find base name without prefix
		const baseHome = getBaseIconForTheme('twotone-home', prefixes);
		expect(baseHome).toEqual({
			name: 'home',
			filter: actualTwotonePrefix,
		});
		expect(baseHome!.filter).toBe(actualTwotonePrefix);

		// Match suffixes
		const homeVariations = getThemeVariations(baseHome, prefixes);
		expect(homeVariations).toEqual([
			{
				name: 'home',
				filter: actualBaselinePrefix,
			},
			{
				name: 'outline-home',
				filter: actualOutlinePrefix,
			},
			{
				name: 'round-home',
				filter: actualRoundPrefix,
			},
			{
				name: 'twotone-home',
				filter: actualTwotonePrefix,
			},
		]);
		expect(homeVariations?.[0].filter).toBe(actualBaselinePrefix);
		expect(homeVariations?.[1].filter).toBe(actualOutlinePrefix);
		expect(homeVariations?.[2].filter).toBe(actualRoundPrefix);
		expect(homeVariations?.[3].filter).toBe(actualTwotonePrefix);
		expect(getThemeVariations('home', prefixes)).toEqual(homeVariations);
		expect(getThemeVariations('twotone-home', prefixes)).toEqual(
			homeVariations
		);

		// Test icon without valid prefix
		// Find base name without prefix
		const baseHome2 = getBaseIconForTheme('solid-home', prefixes);
		expect(baseHome2).toEqual({
			name: 'solid-home',
			filter: actualBaselinePrefix,
		});
		expect(baseHome2!.filter).toBe(actualBaselinePrefix);

		// Match prefixes
		const home2Variations = getThemeVariations(baseHome2, prefixes);
		expect(home2Variations).toEqual([
			{
				name: 'solid-home',
				filter: actualBaselinePrefix,
			},
			{
				name: 'outline-solid-home',
				filter: actualOutlinePrefix,
			},
			{
				name: 'round-solid-home',
				filter: actualRoundPrefix,
			},
			{
				name: 'twotone-solid-home',
				filter: actualTwotonePrefix,
			},
		]);
		expect(home2Variations?.[0].filter).toBe(actualBaselinePrefix);
		expect(home2Variations?.[1].filter).toBe(actualOutlinePrefix);
		expect(home2Variations?.[2].filter).toBe(actualRoundPrefix);
		expect(home2Variations?.[3].filter).toBe(actualTwotonePrefix);
		expect(getThemeVariations('solid-home', prefixes)).toEqual(
			home2Variations
		);
		expect(getThemeVariations('outline-solid-home', prefixes)).toEqual(
			home2Variations
		);
	});

	it('Prefixes and suffixes', () => {
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
				// No actual icons in this icon set, except for dummy icon to make sure it passes import
				whatever: {
					body: '<g />',
				},
			},
			prefixes: {
				baseline: 'Baseline',
				round: 'Round',
				twotone: 'Two-Tone',
			},
			suffixes: {
				'': 'Simple',
				'animated': 'Animated',
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		// Tags should be empty
		const filters = iconSet!.filters;
		expect(filters.tags).toBeUndefined();

		// Check prefixes
		const prefixes = filters.prefixes!;
		const baselinePrefix: IconFinderThemeFilter = {
			title: 'Baseline',
			match: 'baseline-',
			color: 0,
		};
		const roundPrefix: IconFinderThemeFilter = {
			title: 'Round',
			match: 'round-',
			color: 1,
		};
		const twotonePrefix: IconFinderThemeFilter = {
			title: 'Two-Tone',
			match: 'twotone-',
			color: 2,
		};
		const expectedPrefixes: IconFinderThemeFiltersList = {
			type: 'prefixes',
			filters: [baselinePrefix, roundPrefix, twotonePrefix],
			sorted: [baselinePrefix, twotonePrefix, roundPrefix],
			visible: 3,
		};
		expect(prefixes).toEqual(expectedPrefixes);

		// Check suffixes
		const suffixes = filters.suffixes!;
		const defaultSuffix: IconFinderThemeFilter = {
			title: 'Simple',
			match: '',
			color: 3,
		};
		const animatedSuffix: IconFinderThemeFilter = {
			title: 'Animated',
			match: '-animated',
			color: 4,
		};
		const expectedSuffixes: IconFinderThemeFiltersList = {
			type: 'suffixes',
			filters: [defaultSuffix, animatedSuffix],
			sorted: [animatedSuffix],
			empty: defaultSuffix,
			visible: 2,
		};
		expect(suffixes).toEqual(expectedSuffixes);

		// Test 'baseline-home' icon
		const baseHomePrefix = getBaseIconForTheme('baseline-home', prefixes);
		expect(baseHomePrefix).toEqual({
			name: 'home',
			filter: baselinePrefix,
		});

		const baseHomeSuffix = getBaseIconForTheme('baseline-home', suffixes);
		expect(baseHomeSuffix).toEqual({
			name: 'baseline-home',
			filter: defaultSuffix,
		});

		// Match prefixes
		const homePrefixVariations = getThemeVariations(
			'baseline-home',
			prefixes
		);
		expect(homePrefixVariations).toEqual([
			{
				name: 'baseline-home',
				filter: baselinePrefix,
			},
			{
				name: 'round-home',
				filter: roundPrefix,
			},
			{
				name: 'twotone-home',
				filter: twotonePrefix,
			},
		]);
		expect(getThemeVariations('twotone-home', prefixes)).toEqual(
			homePrefixVariations
		);

		const homeSuffixVariations = getThemeVariations(
			'baseline-home',
			suffixes
		);
		expect(homeSuffixVariations).toEqual([
			{
				name: 'baseline-home',
				filter: defaultSuffix,
			},
			{
				name: 'baseline-home-animated',
				filter: animatedSuffix,
			},
		]);
		expect(getThemeVariations('baseline-home-animated', suffixes)).toEqual(
			homeSuffixVariations
		);
	});
});
