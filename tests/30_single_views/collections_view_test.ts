/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import type { CollectionsViewBlocks } from '../../lib/views/collections';
import { CollectionsView } from '../../lib/views/collections';
import { getCollectionsBlockPrefixes } from '../../lib/blocks/collections-list';
import { Registry } from '../../lib/registry';
import type { FullCollectionsRoute } from '../../lib/route/types/routes';
import { objectToRoute } from '../../lib/route/convert';
import type { FullCollectionsRouteParams } from '../../lib/route/types/params';
import type { EventCallback } from '../../lib/events';
import { API as FakeAPI } from '../fake_api';

describe('Testing collections list view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(provider = '', cache = false): Registry {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			provider,
			'/collections',
			{},
			'collections',
			{},
			'collections',
			cache
		);
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		routeParams: FullCollectionsRouteParams | null = null,
		cache = false,
		sync = false
	): CollectionsView {
		const params =
			routeParams === null
				? {
						provider: '',
						filter: '',
						category: null,
				  }
				: routeParams;

		const registry = setupRegistry(params.provider, cache);

		// Change config
		if (sync) {
			// Synchronous test
			const config = registry.config;
			config.router.syncRender = true;
		}

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
				params,
			}) as FullCollectionsRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Do tests
	 */
	it('Creating view', (done) => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as CollectionsView;

			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'collections',
			params: {
				provider: '',
				filter: '',
				category: null,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', (done) => {
		let isSync = true;
		const view = setupView((data: unknown) => {
			// Should be asynchronous
			expect(isSync).to.be.equal(false);

			// Test data
			expect(data).to.be.equal(view);
			expect(view.route).to.be.eql({
				type: 'collections',
				params: {
					provider: '',
					filter: '',
					category: null,
				},
				parent: null,
			});
			done();
		});

		// Make sure call is (a)synchronous by changing variable after setting up view
		isSync = false;
	});

	it('Synchronous test', (done) => {
		let isSync = true;
		const view = setupView(
			(data: unknown) => {
				// Should be synchronous
				expect(isSync).to.be.equal(true);

				// Test data on next tick (to allow 'view' to initialise)
				setTimeout(() => {
					expect(data).to.be.equal(view);
					expect(view.route).to.be.eql({
						type: 'collections',
						params: {
							provider: '',
							filter: '',
							category: null,
						},
						parent: null,
					});
					done();
				});
			},
			null,
			true,
			true
		);

		// Make sure call is (a)synchronous by changing variable after setting up view
		isSync = false;
	});

	it('Async API loading, synchronous loading allowed', (done) => {
		let isSync = true;
		const view = setupView(
			(data: unknown) => {
				// Should be asynchronous
				expect(isSync).to.be.equal(false);

				// Test data
				expect(data).to.be.equal(view);
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: '',
						filter: '',
						category: null,
					},
					parent: null,
				});
				done();
			},
			null,
			false,
			true
		);

		// Make sure call is (a)synchronous by changing variable after setting up view
		isSync = false;
	});

	it('Test custom provider', (done) => {
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);
				expect(view.route).to.be.eql({
					type: 'collections',
					params: {
						provider: 'test',
						filter: '',
						category: null,
					},
					parent: null,
				});
				done();
			},
			{
				provider: 'test',
				filter: '',
				category: null,
			}
		);
	});

	it('Invalid provider', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;

		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(isSync).to.be.equal(false);
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
				params: {
					provider: 'invalid-provider',
				},
			}) as FullCollectionsRoute
		);
		view.startLoading();

		isSync = false;
	});

	it('Invalid provider (synchronous)', (done) => {
		// Load fixture only for 'test' provider
		const registry = new Registry(namespace + nsCounter++);
		registry.config.router.syncRender = true;
		const api = new FakeAPI(registry);
		registry.api = api;

		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(isSync).to.be.equal(true);
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
				params: {
					provider: 'invalid-provider',
				},
			}) as FullCollectionsRoute
		);
		view.startLoading();

		isSync = false;
	});

	it('Provider mismatch', (done) => {
		// Load fixture only for 'test' provider
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, null);
		api.loadFixture('test', '/collections', {}, 'collections');

		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(isSync).to.be.equal(false);
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		isSync = false;
	});

	it('Provider mismatch (synchronous without cache)', (done) => {
		// Load fixture only for 'test' provider
		const registry = new Registry(namespace + nsCounter++);
		registry.config.router.syncRender = true;
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, null);
		api.loadFixture(
			'test',
			'/collections',
			{},
			'collections',
			{},
			'collections',
			true
		);

		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			// Async because Redundancy instance uses setTimeout
			expect(isSync).to.be.equal(false);
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		isSync = false;
	});

	it('Provider mismatch (synchronous with cache)', (done) => {
		// Load fixture only for 'test' provider
		const registry = new Registry(namespace + nsCounter++);
		registry.config.router.syncRender = true;
		const api = new FakeAPI(registry);
		registry.api = api;
		// api.setFakeData('', '/collections', {}, null);
		api.storeCache('', 'collections', null);
		api.loadFixture(
			'test',
			'/collections',
			{},
			'collections',
			{},
			'collections',
			true
		);

		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(isSync).to.be.equal(true);
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();

		isSync = false;
	});

	it('Test not found error', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, null);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});

	it('Test rendering blocks', (done) => {
		let isSync = true;
		const view = setupView(() => {
			expect(isSync).to.be.equal(false);

			const blocks = view.render() as NonNullable<CollectionsViewBlocks>;
			expect(blocks).to.not.be.equal(null);

			// Test categories block
			const categories = Object.keys(blocks.categories.filters);
			expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
			categories.forEach((category) => {
				expect(
					blocks.categories.filters[category].disabled
				).to.be.equal(false);
			});
			expect(blocks.categories.active).to.be.equal(null);

			// Collections block was tested in applyCollectionsFilter() test

			// Test filter block
			expect(blocks.filter.keyword).to.be.equal('');

			done();
		});
		isSync = false;
	});

	it('Test rendering blocks (synchronous)', (done) => {
		let isSync = true;
		setupView(
			(data) => {
				expect(isSync).to.be.equal(true);

				const view = data as CollectionsView;
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach((category) => {
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(false);
				});
				expect(blocks.categories.active).to.be.equal(null);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('');

				done();
			},
			null,
			true,
			true
		);
		isSync = false;
	});

	it('Test filter', (done) => {
		const view = setupView(
			() => {
				let blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach((category) => {
					// Everything except 'General' should be disabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(category !== 'General');
				});
				expect(blocks.categories.active).to.be.equal(null);

				// Check collections
				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql(['mdi', 'mdi-light', 'zmdi']);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('mdi');

				/**
				 * Apply new filter by icon height
				 */
				view.route.params.filter = '20';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionsViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql([
					'dashicons',
					'entypo',
					'foundation',
					'iwwa',
					'entypo-social',
				]);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('20');

				categories.forEach((category) => {
					// Everything except 'Emoji' should be enabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(category === 'Emoji');
				});
				expect(blocks.categories.active).to.be.equal(null);

				done();
			},
			{
				provider: '',
				filter: 'mdi',
				category: null,
			}
		);
	});

	it('Test collections', (done) => {
		const view = setupView(
			() => {
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach((category) => {
					// Everything should be enabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(false);
				});
				expect(blocks.categories.active).to.be.equal('Thematic');

				// Check collections
				expect(
					getCollectionsBlockPrefixes(blocks.collections)
				).to.be.eql(['fa-brands', 'cryptocurrency', 'medical-icon']);

				// Test filter block
				expect(blocks.filter.keyword).to.be.equal('32');

				done();
			},
			{
				provider: '',
				filter: '32',
				category: 'Thematic',
			}
		);
	});

	/**
	 * Bad data
	 */
	it('Bad data (object)', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData(
			'',
			'/collections',
			{},
			JSON.stringify({
				error: 'not_found',
			})
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.loading).to.be.equal(false);
			expect(view.error).to.be.equal('empty');
			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});

	it('Bad data (string)', (done) => {
		const registry = new Registry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('', '/collections', {}, 'whatever');

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CollectionsView;

			expect(view.loading).to.be.equal(false);
			expect(view.error).to.be.equal('empty');
			done();
		});

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
			}) as FullCollectionsRoute
		);
		view.startLoading();
	});
});
