import 'mocha';
import { expect } from 'chai';
import {
	dataToCollection,
	CollectionData,
} from '../../lib/converters/collection';
import { stringToIcon, Icon } from '../../lib/icon';
import { getFixture } from '../get_fixture';

describe('Testing converting collection information', () => {
	it('Simple data', () => {
		let result, expected: CollectionData;

		// Empty block
		result = dataToCollection('', {});
		expect(result).to.be.equal(null);

		// Add prefix
		result = dataToCollection('', {
			prefix: 'foo',
		});
		expect(result).to.be.equal(null);

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
				stringToIcon('foo:arrow-left') as Icon,
				stringToIcon('foo:home') as Icon,
			],
		};
		expect(result).to.be.eql(expected);

		// Add one category
		result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'arrow-left'],
			},
		});
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 2,
			icons: [
				// Order should change because of sorting
				stringToIcon('foo:arrow-left') as Icon,
				stringToIcon('foo:home') as Icon,
			],
		};
		expect(result).to.be.eql(expected);

		// Add two categories
		result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'alert'],
				Extra: ['arrows'],
			},
		});
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', 'Extra'],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert') as Icon, {
					tags: ['Basic'],
				}),
				Object.assign(stringToIcon('foo:arrows') as Icon, {
					tags: ['Extra'],
				}),
				Object.assign(stringToIcon('foo:home') as Icon, {
					tags: ['Basic'],
				}),
			],
		};
		expect(result).to.be.eql(expected);

		// One category + uncategorised
		result = dataToCollection('', {
			prefix: 'foo',
			title: 'Foo',
			categories: {
				Basic: ['home', 'alert'],
			},
			uncategorised: ['arrows'],
		});
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', ''],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert') as Icon, {
					tags: ['Basic'],
				}),
				Object.assign(stringToIcon('foo:arrows') as Icon, {
					tags: [''],
				}),
				Object.assign(stringToIcon('foo:home') as Icon, {
					tags: ['Basic'],
				}),
			],
		};
		expect(result).to.be.eql(expected);

		// Aliases, characters, multiple categories
		result = dataToCollection('', {
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
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 3,
			tags: ['Basic', 'Extra', ''],
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:alert') as Icon, {
					tags: ['Basic', 'Extra'],
				}),
				Object.assign(stringToIcon('foo:arrows') as Icon, {
					tags: [''],
					chars: ['f001'],
				}),
				Object.assign(stringToIcon('foo:home') as Icon, {
					tags: ['Basic'],
					aliases: ['home-outline', 'house'],
					chars: ['f000'],
				}),
			],
		};
		expect(result).to.be.eql(expected);

		// Themes
		result = dataToCollection('', {
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
		expected = {
			provider: '',
			prefix: 'foo',
			name: 'Foo',
			total: 5,
			icons: [
				// Order should change because of sorting
				Object.assign(stringToIcon('foo:outline-alert') as Icon, {
					themePrefix: 'Outline',
					themeSuffix: '',
				}),
				Object.assign(stringToIcon('foo:outline-home') as Icon, {
					themePrefix: 'Outline',
					themeSuffix: '',
				}),
				Object.assign(
					stringToIcon('foo:outline-home-twotone') as Icon,
					{
						themePrefix: 'Outline',
						themeSuffix: 'TwoTone',
					}
				),
				Object.assign(stringToIcon('foo:solid-alert') as Icon, {
					themePrefix: 'Solid',
					themeSuffix: '',
				}),
				Object.assign(stringToIcon('foo:solid-home') as Icon, {
					themePrefix: 'Solid',
					themeSuffix: '',
				}),
			],
			themePrefixes: ['Solid', 'Outline'],
			themeSuffixes: ['TwoTone', ''],
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
		expect(result.themeSuffixes).to.be.eql(['Fill', 'Outline', 'TwoTone']);
	});
});
