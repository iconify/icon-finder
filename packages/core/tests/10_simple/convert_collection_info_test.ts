import 'mocha';
import { expect } from 'chai';
import {
	dataToCollectionInfo,
	CollectionInfo,
} from '../../lib/converters/collection';
import { getFixture } from '../get_fixture';

describe('Testing converting collection information', () => {
	it('Simple info', () => {
		let result, expected: CollectionInfo;

		// Empty block
		result = dataToCollectionInfo({}, 'foo');
		expect(result).to.be.equal(null);

		// Block with name
		result = dataToCollectionInfo(
			{
				name: 'Foo',
			},
			'foo'
		);
		expected = {
			prefix: 'foo',
			name: 'Foo',
			version: '',
			total: 0,
			author: {
				name: 'Unknown',
				url: '',
			},
			license: {
				title: 'Unknown',
				spdx: '',
				url: '',
			},
			samples: [],
			palette: false,
			category: '',
		};
		expect(result).to.be.eql(expected);

		// Block with name passed as "title" and prefix
		result = dataToCollectionInfo({
			prefix: 'foo',
			title: 'Foo',
		});
		expect(result).to.be.eql(expected);

		// Mismatched prefixes
		result = dataToCollectionInfo(
			{
				name: 'Foo',
				prefix: 'bar',
			},
			'foo'
		);
		expect(result).to.be.equal(null);

		// Author in old format
		// License in old format
		// Height as string
		// Long samples list (limited to 3)
		// Palette as boolean
		result = dataToCollectionInfo({
			prefix: 'foo',
			title: 'Foo',
			author: 'Author',
			url: 'https://localhost/',
			license: 'MIT',
			licenseID: 'MIT',
			licenseURL: 'https://license.local/',
			height: '24',
			samples: ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'],
			palette: true,
		});
		expected = {
			prefix: 'foo',
			name: 'Foo',
			version: '',
			total: 0,
			author: {
				name: 'Author',
				url: 'https://localhost/',
			},
			license: {
				title: 'MIT',
				spdx: 'MIT',
				url: 'https://license.local/',
			},
			height: 24,
			samples: ['arrow-left', 'arrow-right', 'arrow-up'],
			displayHeight: 24,
			palette: true,
			category: '',
		};
		expect(result).to.be.eql(expected);

		// Author in new format, missing optional fields
		// License in new format, missing optional fields
		// Height as array of numbers and strings
		// Palette as string
		// Total as string
		result = dataToCollectionInfo({
			prefix: 'foo',
			title: 'Foo',
			total: '100',
			author: {
				name: 'Author',
			},
			license: {
				title: 'BSD',
			},
			height: [16, '18'],
			palette: 'Colorful',
		});
		expected = {
			prefix: 'foo',
			name: 'Foo',
			version: '',
			total: 100,
			author: {
				name: 'Author',
				url: '',
			},
			license: {
				title: 'BSD',
				spdx: '',
				url: '',
			},
			height: [16, 18],
			samples: [],
			palette: true,
			category: '',
		};
		expect(result).to.be.eql(expected);

		// All data in new format
		result = dataToCollectionInfo({
			prefix: 'foo',
			name: 'Foo',
			version: '1.0.0',
			total: 100,
			author: {
				name: 'Author',
				url: 'https://author.local/',
			},
			license: {
				title: 'BSD',
				spdx: 'BSD',
				url: 'https://license.local/',
			},
			height: 32,
			displayHeight: 24,
			samples: ['home', 'pin', 'alert'],
			palette: false,
			category: 'Thematic',
		});
		expected = {
			prefix: 'foo',
			name: 'Foo',
			version: '1.0.0',
			total: 100,
			author: {
				name: 'Author',
				url: 'https://author.local/',
			},
			license: {
				title: 'BSD',
				spdx: 'BSD',
				url: 'https://license.local/',
			},
			height: 32,
			displayHeight: 24,
			samples: ['home', 'pin', 'alert'],
			palette: false,
			category: 'Thematic',
		};
		expect(result).to.be.eql(expected);
	});

	it('Testing ant-design.json', () => {
		// Test "info" field from ant-design.json
		const raw = JSON.parse(getFixture('ant-design.json'));
		const result = dataToCollectionInfo(raw.info, 'ant-design');
		const expected: CollectionInfo = {
			prefix: 'ant-design',
			name: 'Ant Design Icons',
			version: '',
			total: 728,
			author: {
				name: 'HeskeyBaozi',
				url: 'https://github.com/ant-design/ant-design-icons',
			},
			license: {
				title: 'MIT',
				spdx: '',
				url: '',
			},
			height: 16,
			samples: ['pushpin', 'pie-chart-outline', 'user-add-outline'],
			displayHeight: 16,
			palette: false,
			category: 'General',
		};
		expect(result).to.be.eql(expected);
	});

	it('Testing fa.json', () => {
		// Test "info" field from fa.json
		const raw = JSON.parse(getFixture('fa.json'));
		const result = dataToCollectionInfo(raw.info, 'fa');
		const expected: CollectionInfo = {
			prefix: 'fa',
			name: 'Font Awesome 4',
			total: 678,
			author: {
				name: 'Dave Gandy',
				url: 'http://fontawesome.io/',
			},
			license: {
				title: 'Open Font License',
				spdx: '',
				url:
					'http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL',
			},
			samples: ['wrench', 'bell-o', 'user-o'],
			version: '4.7.0',
			palette: false,
			category: 'General',
		};
		expect(result).to.be.eql(expected);
	});
});
