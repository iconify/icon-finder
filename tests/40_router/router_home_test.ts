/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import SVGFramework from '@iconify/iconify';
import { setIconify } from '../../lib/iconify';
import { Registry } from '../../lib/registry';
import {
	API as FakeAPI,
	collectionQueryParams,
	collectionsQueryParams,
} from '../fake_api';
import { convertCustomSets } from '../../lib/data/custom-sets';

// Set SVG Framework
setIconify(SVGFramework);

describe('Testing home route with custom icon sets', () => {
	const namespace = __filename;
	let nsCounter = 0;

	const prefixStart = 'home-route-';
	let prefixCounter = 0;

	/**
	 * Get next prefix
	 */
	function nextPrefix(): string {
		return prefixStart + prefixCounter++;
	}

	/**
	 * Setup registry for test
	 */
	function setupRegistry(provider = ''): Registry {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			provider,
			'/collections',
			collectionsQueryParams(),
			'collections'
		);
		return registry;
	}

	/**
	 * Do tests
	 */
	it('Default', () => {
		const registry = setupRegistry();

		// Create router
		const router = registry.router;

		// Check route
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);

		// Navigate to home
		router.home();

		// Check route
		expect(router.partialRoute).to.be.eql({
			type: 'collections',
		});
	});

	it('Custom config', () => {
		const registry = setupRegistry();
		const config = registry.config;

		// Set custom home route
		config.router.home = JSON.stringify({
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
		});

		// Load fixture
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		// Create router
		const router = registry.router;

		// Check route
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);

		// Navigate to home
		router.home();

		// Check route
		expect(router.partialRoute).to.be.eql({
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
		});
	});

	it('One custom icon set', () => {
		const prefix = nextPrefix();
		const registry = setupRegistry();

		// Set custom icon set
		registry.customIconSets = convertCustomSets({
			iconSets: [
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
			],
		});

		// Create router
		const router = registry.router;

		// Check route
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);

		// Navigate to home
		router.home();

		// Check route
		expect(router.partialRoute).to.be.eql({
			type: 'collection',
			params: {
				prefix,
			},
		});
	});

	it('One custom icon set, merge enabled', () => {
		const prefix = nextPrefix();
		const registry = setupRegistry();

		// Set custom icon set
		registry.customIconSets = convertCustomSets({
			iconSets: [
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
			],
			merge: 'custom-last',
		});

		// Create router
		const router = registry.router;

		// Check route
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);

		// Navigate to home
		router.home();

		// Check route
		expect(router.partialRoute).to.be.eql({
			type: 'collections',
		});
	});

	it('Multiple custom icon sets', () => {
		const prefix1 = nextPrefix();
		const prefix2 = nextPrefix();
		const registry = setupRegistry();

		// Set custom icon sets
		registry.customIconSets = convertCustomSets({
			iconSets: [
				{
					info: {
						name: 'Test',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix: prefix1,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
				{
					info: {
						name: 'Test 2',
						author: {
							name: 'Unit Test',
						},
						license: {
							title: 'MIT',
						},
						palette: false,
						samples: [],
						category: 'General',
					},
					prefix: prefix2,
					icons: {
						home: {
							body: '<g />',
						},
					},
				},
			],
			merge: 'only-custom',
		});

		// Create router
		const router = registry.router;

		// Check route
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);

		// Navigate to home
		router.home();

		// Check route
		expect(router.partialRoute).to.be.eql({
			type: 'collections',
		});
	});
});
