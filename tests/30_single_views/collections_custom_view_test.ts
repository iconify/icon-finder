/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import { Registry } from '../../lib/registry';
import type { FullCollectionsRoute } from '../../lib/route/types/routes';
import { objectToRoute } from '../../lib/route/convert';
import { API as FakeAPI, collectionsQueryParams } from '../fake_api';
import type { EventCallback } from '../../lib/events';
import type { IconFinderCustomSets } from '../../lib/data/custom-sets';
import { convertCustomSets } from '../../lib/data/custom-sets';
import type { CollectionsViewBlocks } from '../../lib/views/collections';
import { CollectionsView } from '../../lib/views/collections';

describe('Testing collections view with custom data', () => {
	const namespace = __filename;
	let nsCounter = 0;

	const prefixStart = 'collections-view-';
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
	function setupRegistry(): Registry {
		const registry = new Registry(namespace + nsCounter++);

		// Change API to fake API
		const api = new FakeAPI(registry);
		registry.api = api;
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		iconSets: IconFinderCustomSets,
		provider?: string
	): CollectionsView {
		const registry = setupRegistry();

		// Load fixture for collections list
		if (typeof provider === 'string') {
			(registry.api as FakeAPI).loadFixture(
				provider,
				'/collections',
				collectionsQueryParams(),
				'collections'
			);
		}

		// Set custom data
		registry.customIconSets = convertCustomSets(iconSets, false);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		return view;
	}

	it('One custom icon set', (done) => {
		const prefix = nextPrefix();
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: '',
						category: null,
						filter: '',
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories filter: should be empty
				expect(blocks.categories.filters).to.be.eql({});

				// Test collections
				expect(
					Object.keys(blocks.collections.collections.visible)
				).to.be.eql(['Custom']);
				expect(
					Object.keys(
						blocks.collections.collections.visible['Custom']
					)
				).to.be.eql([prefix]);

				done();
			},
			{
				merge: 'only-custom',
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
							category: 'Custom',
						},
						prefix,
						icons: {
							home: {
								body: '<g />',
							},
						},
					},
				],
			}
		);
	});

	it('Merge custom and default icon sets', (done) => {
		const prefix = nextPrefix();
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: '',
						category: null,
						filter: '',
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories filter: should have default sets
				expect(Object.keys(blocks.categories.filters)).to.be.eql([
					'Custom',
					'General',
					'Emoji',
					'Thematic',
				]);

				// Test collections
				expect(
					Object.keys(
						blocks.collections.collections.visible['Custom']
					)
				).to.be.eql([prefix]);
				expect(
					Object.keys(
						blocks.collections.collections.visible['Thematic']
					)
				).to.be.eql([
					'logos',
					'simple-icons',
					'fa-brands',
					'brandico',
					'entypo-social',
					'cryptocurrency',
					'wi',
					'geo',
					'map',
					'medical-icon',
				]);

				done();
			},
			{
				merge: 'custom-first',
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
							category: 'Custom',
						},
						prefix,
						icons: {
							home: {
								body: '<g />',
							},
						},
					},
				],
			},
			''
		);
	});

	it('Merge with duplicate sets', (done) => {
		const prefix = 'wi';
		const category = 'Thematic';
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: '',
						category: null,
						filter: '',
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories filter: should have Thematic first
				expect(Object.keys(blocks.categories.filters)).to.be.eql([
					'Thematic',
					'General',
					'Emoji',
				]);

				// Test collections
				expect(
					Object.keys(
						blocks.collections.collections.visible['Thematic']
					)
				).to.be.eql([
					'wi',
					'logos',
					'simple-icons',
					'fa-brands',
					'brandico',
					'entypo-social',
					'cryptocurrency',
					'geo',
					'map',
					'medical-icon',
				]);

				done();
			},
			{
				merge: 'custom-first',
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
							category: category,
						},
						prefix,
						icons: {
							home: {
								body: '<g />',
							},
						},
					},
				],
			},
			''
		);
	});

	it('Merge with duplicate sets, different categories', (done) => {
		const prefix = 'wi';
		const category = 'General';
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Make sure all route params have been setup
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: '',
						category: null,
						filter: '',
					},
					parent: null,
				});

				// Test blocks
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories filter: should have default order
				expect(Object.keys(blocks.categories.filters)).to.be.eql([
					'General',
					'Emoji',
					'Thematic',
				]);

				// Test collections
				expect(
					Object.keys(
						blocks.collections.collections.visible[category]
					).indexOf(prefix)
				).to.be.equal(0);
				expect(
					Object.keys(
						blocks.collections.collections.visible['Thematic']
					)
				).to.be.eql([
					// 'wi', // should not be in this list
					'logos',
					'simple-icons',
					'fa-brands',
					'brandico',
					'entypo-social',
					'cryptocurrency',
					'geo',
					'map',
					'medical-icon',
				]);

				done();
			},
			{
				merge: 'custom-first',
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
							category: category,
						},
						prefix,
						icons: {
							home: {
								body: '<g />',
							},
						},
					},
				],
			},
			''
		);
	});
});
