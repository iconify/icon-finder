/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type { APIProviderRawData } from '../../lib/data/providers';
import { convertProviderData } from '../../lib/data/providers';

describe('Testing converting provider data', () => {
	it('Invalid items', () => {
		// Empty
		expect(
			convertProviderData('https://localhost', {} as APIProviderRawData)
		).to.be.equal(null);

		// Make sure that setting provider is enough
		expect(
			convertProviderData('https://localhost', {
				provider: 'foo',
			} as APIProviderRawData)
		).to.not.be.equal(null);

		// Invalid providers
		expect(
			convertProviderData('https://localhost', {
				provider: 'Iconify',
			} as APIProviderRawData)
		).to.be.equal(null);

		expect(
			convertProviderData('https://localhost', ({
				provider: null,
			} as unknown) as APIProviderRawData)
		).to.be.equal(null);

		expect(
			convertProviderData('https://localhost', {
				provider: 'foo_bar',
			} as APIProviderRawData)
		).to.be.equal(null);
	});

	it('Title', () => {
		// No title
		let result = convertProviderData('https://localhost', {
			provider: 'foo',
		});
		expect(result).to.not.be.equal(null);
		expect(result!.title).to.be.equal('foo');

		// Title
		result = convertProviderData('https://localhost', {
			provider: 'foo',
			title: 'Foo',
		});
		expect(result).to.not.be.equal(null);
		expect(result!.title).to.be.equal('Foo');

		// Invalid title
		result = convertProviderData('https://localhost', ({
			provider: 'foo',
			title: 100,
		} as unknown) as APIProviderRawData);
		expect(result).to.not.be.equal(null);
		expect(result!.title).to.be.equal('foo');
	});

	it('API host', () => {
		// Default host
		let result = convertProviderData('https://localhost', {
			provider: 'foo',
		});
		expect(result).to.not.be.equal(null);
		let config = result!.config;
		expect(config.resources).to.be.eql(['https://localhost']);

		// Custom host as string
		result = convertProviderData('https://localhost', {
			provider: 'foo',
			api: 'https://api.iconify.dev',
		});
		expect(result).to.not.be.equal(null);
		config = result!.config;
		expect(config.resources).to.be.eql(['https://api.iconify.dev']);

		// Custom host as array
		result = convertProviderData('https://localhost', {
			provider: 'foo',
			api: ['https://api1.iconify.dev', 'https://api2.iconify.dev'],
		});
		expect(result).to.not.be.equal(null);
		config = result!.config;
		expect(config.resources).to.be.eql([
			'https://api1.iconify.dev',
			'https://api2.iconify.dev',
		]);
	});

	it('Links', () => {
		// Empty
		let result = convertProviderData('https://localhost', {
			provider: 'foo',
		});
		expect(result).to.not.be.equal(null);
		expect(result!.links).to.be.eql({
			home: '',
			collection: '',
			icon: '',
		});
		expect(result!.npm).to.be.eql({
			package: '',
			icon: '',
		});

		// Partial
		result = convertProviderData('https://localhost', {
			provider: 'foo',
			links: {
				home: 'http://localhost',
			},
			npm: {
				package: '@foo/bar-{prefix}',
			},
		});
		expect(result).to.not.be.equal(null);
		expect(result!.links).to.be.eql({
			home: 'http://localhost',
			collection: '',
			icon: '',
		});
		expect(result!.npm).to.be.eql({
			package: '@foo/bar-{prefix}',
			icon: '',
		});

		// Full
		result = convertProviderData('https://localhost', {
			provider: 'foo',
			links: {
				home: 'https://foo.dev/icons',
				collection: 'https://foo.dev/icons/{prefix}/',
				icon: 'https://foo.dev/icons/{prefix}/{name}.html',
			},
			npm: {
				package: '@foo-icons/{prefix}',
				icon: '@foo-icons/{prefix}/{name}',
			},
		});
		expect(result).to.not.be.equal(null);
		expect(result!.links).to.be.eql({
			home: 'https://foo.dev/icons',
			collection: 'https://foo.dev/icons/{prefix}/',
			icon: 'https://foo.dev/icons/{prefix}/{name}.html',
		});
		expect(result!.npm).to.be.eql({
			package: '@foo-icons/{prefix}',
			icon: '@foo-icons/{prefix}/{name}',
		});
	});
});
