/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { CollectionData } from '../../lib/converters/collection';
import { dataToCollection } from '../../lib/converters/collection';
import { stringToIcon } from '../../lib/misc/icon';
import { getFixture } from '../get_fixture';

describe('Testing converting collection information', () => {
	it('Simple data', () => {
		let result: CollectionData | null;
		let expected: CollectionData;

		// Empty block
		result = dataToCollection('', {});
		expect(result).to.be.equal(null);

		// Add prefix
		result = dataToCollection('', {
			prefix: 'foo',
		});
		expect(result).to.be.eql({
			provider: '',
			prefix: 'foo',
			name: 'foo',
			icons: [],
			total: 0,
		});

		// Add name
		result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
		});
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 0,
			icons: [],
		};
		expect(result).to.be.eql(expected);

		// Add few icons
		result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			uncategorized: ['home', 'arrow-left'],
		});
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 2,
			icons: [
				// Order should change because of sorting
				stringToIcon('foo:arrow-left')!,
				stringToIcon('foo:home')!,
			],
		};
		expect(result).to.be.eql(expected);
	});

	it('Category', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'arrow-left'],
			},
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 2,
			icons: [
				// Order should change because of sorting
				stringToIcon('foo:arrow-left')!,
				stringToIcon('foo:home')!,
			],
		};
		expect(result).to.be.eql(expected);
	});

	it('Two categories', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'alert'],
				Extra: ['arrows'],
			},
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', 'Extra'],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert')!, {
					tags: ['Basic'],
				}),
				Object.assign(stringToIcon('foo:arrows')!, {
					tags: ['Extra'],
				}),
				Object.assign(stringToIcon('foo:home')!, {
					tags: ['Basic'],
				}),
			],
		};
		expect(result).to.be.eql(expected);
	});

	it('One category + uncategorised', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'alert'],
			},
			uncategorised: ['arrows'],
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', ''],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert')!, {
					tags: ['Basic'],
				}),
				Object.assign(stringToIcon('foo:arrows')!, {
					tags: [''],
				}),
				Object.assign(stringToIcon('foo:home')!, {
					tags: ['Basic'],
				}),
			],
		};
		expect(result).to.be.eql(expected);
	});

	it('Empty category', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Location: [],
				Whatever: [],
			},
			uncategorised: ['arrows'],
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 1,
			icons: [stringToIcon('foo:arrows')!],
		};
		expect(result).to.be.eql(expected);
	});

	it('Categories with subcategories', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Arrows: {
					// Sub-categories
					'Big Arrows': ['big-arrow-left', 'big-arrow-right'],
					'Small Arrows': ['small-arrow-left', 'small-arrow-right'],
				},
				Location: ['location'],
			},
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 5,
			icons: [
				Object.assign(stringToIcon('foo:big-arrow-left')!, {
					tags: ['Arrows'],
				}),
				Object.assign(stringToIcon('foo:big-arrow-right')!, {
					tags: ['Arrows'],
				}),
				Object.assign(stringToIcon('foo:location')!, {
					tags: ['Location'],
				}),
				Object.assign(stringToIcon('foo:small-arrow-left')!, {
					tags: ['Arrows'],
				}),
				Object.assign(stringToIcon('foo:small-arrow-right')!, {
					tags: ['Arrows'],
				}),
			],
			tags: ['Arrows', 'Location'],
		};
		expect(result).to.be.eql(expected);
	});

	it('Aliases, characters, multiple categories', () => {
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'alert'],
				Extra: ['alert'],
			},
			uncategorised: ['arrows'],
			aliases: {
				'home-outline': 'home',
				'house': 'home',
			},
			chars: {
				f000: 'home',
				f001: 'arrows',
			},
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', 'Extra', ''],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert')!, {
					tags: ['Basic', 'Extra'],
				}),
				Object.assign(stringToIcon('foo:arrows')!, {
					tags: [''],
					chars: ['f001'],
				}),
				Object.assign(stringToIcon('foo:home')!, {
					tags: ['Basic'],
					aliases: ['home-outline', 'house'],
					chars: ['f000'],
				}),
			],
		};
		expect(result).to.be.eql(expected);
	});

	it('Themes', () => {
		// Themes
		const result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			uncategorised: [
				'solid-home',
				'outline-home',
				'outline-home-twotone',
				'solid-alert',
				'outline-alert',
			],
			themes: {
				solid: {
					title: 'Solid',
					prefix: 'solid-',
				},
				outline: {
					title: 'Outline',
					prefix: 'outline', // Missing -
				},
				twotone: {
					title: 'TwoTone',
					suffix: '-twotone',
				},
			},
		});
		const expected: CollectionData = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 5,
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:outline-alert')!, {
					themePrefixes: ['Outline'],
					themeSuffixes: [''],
				}),
				Object.assign(stringToIcon('foo:outline-home')!, {
					themePrefixes: ['Outline'],
					themeSuffixes: [''],
				}),
				Object.assign(stringToIcon('foo:outline-home-twotone')!, {
					themePrefixes: ['Outline'],
					themeSuffixes: ['TwoTone'],
				}),
				Object.assign(stringToIcon('foo:solid-alert')!, {
					themePrefixes: ['Solid'],
					themeSuffixes: [''],
				}),
				Object.assign(stringToIcon('foo:solid-home')!, {
					themePrefixes: ['Solid'],
					themeSuffixes: [''],
				}),
			],
			themePrefixes: {
				'solid-': 'Solid',
				'outline-': 'Outline',
			},
			themeSuffixes: {
				'-twotone': 'TwoTone',
				'': '',
			},
		};
		expect(result).to.be.eql(expected);
	});

	it('ant-design with provider', () => {
		const raw = JSON.parse(getFixture('ant-design.json'));
		const result = dataToCollection('test', raw) as NonNullable<
			CollectionData
		>;

		expect(result).to.not.be.equal(null);

		expect(result.total).to.be.equal(728);
		expect(result.icons.length).to.be.equal(result.total);
		expect(result.icons[0].provider).to.be.equal('test');

		expect(result.info).to.not.be.equal(void 0);

		expect(result.tags).to.be.equal(void 0);
		expect(result.themePrefixes).to.be.equal(void 0);
		expect(result.themeSuffixes).to.be.eql({
			'-fill': 'Fill',
			'-outline': 'Outline',
			'-twotone': 'TwoTone',
		});
	});

	it('Hidden icons with aliases', () => {
		const raw = JSON.parse(getFixture('mdi.json'));
		const result = dataToCollection('', raw) as NonNullable<CollectionData>;

		expect(result).to.not.be.equal(null);

		expect(result.hidden).to.be.eql([
			// Hidden icon
			'amazon-drive',
			// Alias of a hidden icon
			'amazon-clouddrive',
			// More hidden icons
			'hidden-icon',
			'hidden-alias',
		]);
	});
});
