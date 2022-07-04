/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON } from '@iconify/types';
import { convertRawIconSet } from '../../lib/icon-set/convert/raw';

describe('Convert raw icon set', () => {
	it('Missing info', () => {
		const raw: IconifyJSON = {
			prefix: 'foo',
			icons: {
				home: {
					body: '<g />',
				},
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeNull();
	});

	it('Few icons', () => {
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
				home: {
					body: '<g id="home" />',
				},
				account: {
					body: '<g id="account" />',
				},
				hidden: {
					body: '<g id="hidden" />',
					hidden: true,
				},
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		expect(iconSet!.source).toBe('raw');
		expect(iconSet!.provider).toBe('');
		expect(iconSet!.prefix).toBe(prefix);
		expect(iconSet!.total).toBe(2);
		expect(iconSet!.info).toEqual({
			name: 'Test',
			author: {
				name: 'Unknown',
			},
			license: {
				title: 'MIT',
			},
			total: 2,
		});

		// Icons
		const { map, unique } = iconSet!.icons;

		// Map must include all icons
		expect(Object.keys(map)).toEqual(['home', 'account', 'hidden']);

		// All icons are unique
		expect(unique.length).toBe(3);

		// Check icons
		const homeIcon = map['home'];
		expect(homeIcon).toEqual({
			icons: [
				{
					name: 'home',
				},
			],
			render: 'home',
		});

		const hiddenIcon = map['hidden'];
		expect(hiddenIcon).toEqual({
			icons: [
				{
					name: 'hidden',
					hidden: true,
				},
			],
			render: 'hidden',
			hidden: true,
		});
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
				home: {
					body: '<g id="home" />',
				},
				account: {
					body: '<g id="account" />',
				},
				hidden: {
					body: '<g id="hidden" />',
					hidden: true,
				},
			},
			aliases: {
				'house': {
					parent: 'home',
				},
				'user': {
					parent: 'account',
				},
				'account2': {
					// alias before parent
					parent: 'user2',
				},
				// new icons
				'house-rtl': {
					parent: 'house',
					hFlip: true,
				},
				'user2': {
					parent: 'user',
					rotate: 1,
				},
				// same as 'house-rtl', with different parent
				'home-rtl': {
					parent: 'home',
					hFlip: true,
				},
				// hidden alias of 'home'
				'house-hidden': {
					parent: 'house',
					// testing hidden alias of visible icon
					hidden: true,
				},
				'house-well-hidden': {
					// testing alias of hidden alias of visible icon
					parent: 'house-hidden',
				},
				// aliases of 'hidden'
				'well-hidden': {
					parent: 'hidden',
				},
				'well-hidden2': {
					parent: 'hidden',
					// testing hidden alias of hidden icon
					hidden: true,
				},
				'well-hidden3': {
					// testing alias of hidden alias of hidden icon
					parent: 'well-hidden2',
				},
				// invalid aliases
				'bad-alias': {
					parent: 'bad-icon',
				},
				'account': {
					parent: 'hidden',
				},
			},
		};

		// Convert icon set
		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		const expectedTotal = 5; // 3 icons + 2 variations
		const expectedVisible = 4; // 2 icons + 2 variations

		expect(iconSet!.source).toBe('raw');
		expect(iconSet!.provider).toBe('');
		expect(iconSet!.prefix).toBe(prefix);
		expect(iconSet!.total).toBe(expectedVisible);
		expect(iconSet!.info).toEqual({
			name: 'Test',
			author: {
				name: 'Unknown',
			},
			license: {
				title: 'MIT',
			},
			total: expectedVisible,
		});

		// Icons
		const { map, unique } = iconSet!.icons;

		// Map must include all icons
		expect(Object.keys(map)).toEqual([
			'home',
			'account',
			'hidden',
			'house',
			'user',
			'account2',
			'user2',
			'house-rtl',
			'home-rtl',
			'house-hidden',
			'house-well-hidden',
			'well-hidden',
			'well-hidden2',
			'well-hidden3',
		]);

		// Check length
		expect(unique.length).toBe(expectedTotal);

		// Check icons
		const homeIcon = map['home'];
		expect(homeIcon).toEqual({
			icons: [
				{
					name: 'home',
				},
				{
					name: 'house',
				},
				{
					name: 'house-hidden',
					hidden: true,
				},
				{
					name: 'house-well-hidden',
					hidden: true,
				},
			],
			render: 'home',
			transformations: ['house-rtl'],
		});

		const accountIcon = map['account'];
		expect(accountIcon).toEqual({
			icons: [
				{
					name: 'account',
				},
				{
					name: 'user',
				},
			],
			render: 'account',
			transformations: ['account2'],
		});

		const hiddenIcon = map['hidden'];
		expect(hiddenIcon).toEqual({
			icons: [
				{
					name: 'hidden',
					hidden: true,
				},
				{
					name: 'well-hidden',
					hidden: true,
				},
				{
					name: 'well-hidden2',
					hidden: true,
				},
				{
					name: 'well-hidden3',
					hidden: true,
				},
			],
			render: 'hidden',
			hidden: true,
		});
	});

	it('Clones', () => {
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
				home: {
					body: '<g />',
				},
				house: {
					body: '<g />',
				},
				account: {
					body: '<g id="account" />',
					// resolving hidden before visible
					hidden: true,
				},
				user: {
					body: '<g id="account" />',
				},
			},
			aliases: {
				// transformations
				'house-rtl': {
					parent: 'house',
					hFlip: true,
				},
				'home-rtl': {
					parent: 'home',
					hFlip: true,
				},
			},
		};

		const iconSet = convertRawIconSet('', raw);
		expect(iconSet).toBeTruthy();

		const expectedTotal = 3; // 2 icons + 1 variation
		const expectedVisible = 3; // 2 icons + 1 variation

		expect(iconSet!.source).toBe('raw');
		expect(iconSet!.provider).toBe('');
		expect(iconSet!.prefix).toBe(prefix);
		expect(iconSet!.total).toBe(expectedVisible);
		expect(iconSet!.info).toEqual({
			name: 'Test',
			author: {
				name: 'Unknown',
			},
			license: {
				title: 'MIT',
			},
			total: expectedVisible,
		});

		// Icons
		const { map, unique } = iconSet!.icons;

		// Map must include all icons
		expect(Object.keys(map)).toEqual([
			'home',
			'house',
			'account',
			'user',
			'house-rtl',
			'home-rtl',
		]);

		// Check length of unique icons list
		expect(unique.length).toBe(expectedTotal);
	});
});