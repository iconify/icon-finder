/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import { convertRawIconSet } from '../../lib/icon-set/convert/raw';
import { getBaseIconForTheme } from '../../lib/icon-set/themes/base';
import { getThemeVariations } from '../../lib/icon-set/themes/variations';
import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeItem,
} from '../../lib/icon-set/types/themes';

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

		// Prefixes and categories should be empty
		expect(iconSet?.prefixes).toBeUndefined();
		expect(iconSet?.categories).toBeUndefined();

		// Check suffixes
		const suffixes = iconSet!.suffixes!;
		const solidSuffix: IconFinderIconSetThemeItem = {
			title: 'Solid',
			match: '-solid',
			color: 0,
		};
		const outlineSuffix: IconFinderIconSetThemeItem = {
			title: 'Outline',
			match: '-outline',
			color: 1,
		};
		const twotoneSuffix: IconFinderIconSetThemeItem = {
			title: 'Two-Tone',
			match: '-twotone',
			color: 2,
		};
		const expectedSuffixes: IconFinderIconSetTheme = {
			type: 'suffixes',
			items: [solidSuffix, outlineSuffix, twotoneSuffix],
			sorted: [outlineSuffix, twotoneSuffix, solidSuffix],
		};
		expect(suffixes).toEqual(expectedSuffixes);

		// Get actual items, make sure they are not clones
		const [actualSolidSuffix, actualOutlineSuffix, actualTwotoneSuffix] =
			suffixes.items;
		expect(suffixes.sorted[0]).toBe(actualOutlineSuffix);
		expect(suffixes.sorted[1]).toBe(actualTwotoneSuffix);
		expect(suffixes.sorted[2]).toBe(actualSolidSuffix);

		// Check 'account' icon
		// Base name without suffix
		const baseAccount = getBaseIconForTheme('account-twotone', suffixes);
		expect(baseAccount).toEqual({
			name: 'account',
			item: actualTwotoneSuffix,
		});
		expect(baseAccount.item).toBe(actualTwotoneSuffix);

		// Match suffixes
		const accountVariations = getThemeVariations(
			'account-twotone',
			suffixes
		);
		expect(accountVariations).toEqual([
			{
				name: 'account-solid',
				item: actualSolidSuffix,
			},
			{
				name: 'account-outline',
				item: actualOutlineSuffix,
			},
			{
				name: 'account-twotone',
				item: actualTwotoneSuffix,
			},
		]);
		expect(accountVariations?.[0].item).toBe(actualSolidSuffix);
		expect(accountVariations?.[1].item).toBe(actualOutlineSuffix);
		expect(accountVariations?.[2].item).toBe(actualTwotoneSuffix);

		// Check 'home' icon
		// Base name without suffix
		const baseHome = getBaseIconForTheme('home-solid', suffixes);
		expect(baseHome).toEqual({
			name: 'home',
			item: actualSolidSuffix,
		});
		expect(baseHome.item).toBe(actualSolidSuffix);

		// Match suffixes
		const homeVariations = getThemeVariations(baseHome, suffixes);
		expect(homeVariations).toEqual([
			{
				name: 'home-solid',
				item: actualSolidSuffix,
			},
			{
				name: 'home-outline',
				item: actualOutlineSuffix,
			},
			{
				name: 'home-twotone',
				item: actualTwotoneSuffix,
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

		// Suffixes and categories should be empty
		expect(iconSet?.suffixes).toBeUndefined();
		expect(iconSet?.categories).toBeUndefined();

		// Check prefixes
		const prefixes = iconSet!.prefixes!;
		const baselinePrefix: IconFinderIconSetThemeItem = {
			title: 'Baseline',
			match: '',
			color: 0,
		};
		const outlinePrefix: IconFinderIconSetThemeItem = {
			title: 'Outline',
			match: 'outline-',
			color: 1,
		};
		const roundPrefix: IconFinderIconSetThemeItem = {
			title: 'Round',
			match: 'round-',
			color: 2,
		};
		const twotonePrefix: IconFinderIconSetThemeItem = {
			title: 'Two-Tone',
			match: 'twotone-',
			color: 3,
		};
		const expectedPrefixes: IconFinderIconSetTheme = {
			type: 'prefixes',
			items: [baselinePrefix, outlinePrefix, roundPrefix, twotonePrefix],
			sorted: [outlinePrefix, twotonePrefix, roundPrefix],
			empty: baselinePrefix,
		};
		expect(prefixes).toEqual(expectedPrefixes);

		// Get actual items, make sure they are not clones
		const [
			actualBaselinePrefix,
			actualOutlinePrefix,
			actualRoundPrefix,
			actualTwotonePrefix,
		] = prefixes.items;
		expect(prefixes.sorted[0]).toBe(actualOutlinePrefix);
		expect(prefixes.sorted[1]).toBe(actualTwotonePrefix);
		expect(prefixes.sorted[2]).toBe(actualRoundPrefix);
		expect(prefixes.empty).toBe(actualBaselinePrefix);

		// Test 'home' icon
		// Find base name without prefix
		const baseHome = getBaseIconForTheme('twotone-home', prefixes);
		expect(baseHome).toEqual({
			name: 'home',
			item: actualTwotonePrefix,
		});
		expect(baseHome.item).toBe(actualTwotonePrefix);

		// Match suffixes
		const homeVariations = getThemeVariations(baseHome, prefixes);
		expect(homeVariations).toEqual([
			{
				name: 'home',
				item: actualBaselinePrefix,
			},
			{
				name: 'outline-home',
				item: actualOutlinePrefix,
			},
			{
				name: 'round-home',
				item: actualRoundPrefix,
			},
			{
				name: 'twotone-home',
				item: actualTwotonePrefix,
			},
		]);
		expect(homeVariations?.[0].item).toBe(actualBaselinePrefix);
		expect(homeVariations?.[1].item).toBe(actualOutlinePrefix);
		expect(homeVariations?.[2].item).toBe(actualRoundPrefix);
		expect(homeVariations?.[3].item).toBe(actualTwotonePrefix);
		expect(getThemeVariations('home', prefixes)).toEqual(homeVariations);
		expect(getThemeVariations('twotone-home', prefixes)).toEqual(
			homeVariations
		);

		// Test icon without valid prefix
		// Find base name without prefix
		const baseHome2 = getBaseIconForTheme('solid-home', prefixes);
		expect(baseHome2).toEqual({
			name: 'solid-home',
			item: actualBaselinePrefix,
		});
		expect(baseHome2.item).toBe(actualBaselinePrefix);

		// Match prefixes
		const home2Variations = getThemeVariations(baseHome2, prefixes);
		expect(home2Variations).toEqual([
			{
				name: 'solid-home',
				item: actualBaselinePrefix,
			},
			{
				name: 'outline-solid-home',
				item: actualOutlinePrefix,
			},
			{
				name: 'round-solid-home',
				item: actualRoundPrefix,
			},
			{
				name: 'twotone-solid-home',
				item: actualTwotonePrefix,
			},
		]);
		expect(home2Variations?.[0].item).toBe(actualBaselinePrefix);
		expect(home2Variations?.[1].item).toBe(actualOutlinePrefix);
		expect(home2Variations?.[2].item).toBe(actualRoundPrefix);
		expect(home2Variations?.[3].item).toBe(actualTwotonePrefix);
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

		// Categories should be empty
		expect(iconSet?.categories).toBeUndefined();

		// Check prefixes
		const prefixes = iconSet!.prefixes!;
		const baselinePrefix: IconFinderIconSetThemeItem = {
			title: 'Baseline',
			match: 'baseline-',
			color: 0,
		};
		const roundPrefix: IconFinderIconSetThemeItem = {
			title: 'Round',
			match: 'round-',
			color: 1,
		};
		const twotonePrefix: IconFinderIconSetThemeItem = {
			title: 'Two-Tone',
			match: 'twotone-',
			color: 2,
		};
		const expectedPrefixes: IconFinderIconSetTheme = {
			type: 'prefixes',
			items: [baselinePrefix, roundPrefix, twotonePrefix],
			sorted: [baselinePrefix, twotonePrefix, roundPrefix],
		};
		expect(prefixes).toEqual(expectedPrefixes);

		// Check suffixes
		const suffixes = iconSet!.suffixes!;
		const defaultSuffix: IconFinderIconSetThemeItem = {
			title: 'Simple',
			match: '',
			color: 3,
		};
		const animatedSuffix: IconFinderIconSetThemeItem = {
			title: 'Animated',
			match: '-animated',
			color: 4,
		};
		const expectedSuffixes: IconFinderIconSetTheme = {
			type: 'suffixes',
			items: [defaultSuffix, animatedSuffix],
			sorted: [animatedSuffix],
			empty: defaultSuffix,
		};
		expect(suffixes).toEqual(expectedSuffixes);

		// Test 'baseline-home' icon
		const baseHomePrefix = getBaseIconForTheme('baseline-home', prefixes);
		expect(baseHomePrefix).toEqual({
			name: 'home',
			item: baselinePrefix,
		});

		const baseHomeSuffix = getBaseIconForTheme('baseline-home', suffixes);
		expect(baseHomeSuffix).toEqual({
			name: 'baseline-home',
			item: defaultSuffix,
		});

		// Match prefixes
		const homePrefixVariations = getThemeVariations(
			'baseline-home',
			prefixes
		);
		expect(homePrefixVariations).toEqual([
			{
				name: 'baseline-home',
				item: baselinePrefix,
			},
			{
				name: 'round-home',
				item: roundPrefix,
			},
			{
				name: 'twotone-home',
				item: twotonePrefix,
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
				item: defaultSuffix,
			},
			{
				name: 'baseline-home-animated',
				item: animatedSuffix,
			},
		]);
		expect(getThemeVariations('baseline-home-animated', suffixes)).toEqual(
			homeSuffixVariations
		);
	});
});
