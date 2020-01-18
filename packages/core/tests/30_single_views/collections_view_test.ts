/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import {
	CollectionsView,
	CollectionsViewBlocks,
} from '../../lib/views/collections';
import { getCollectionsBlockPrefixes } from '../../lib/blocks/collections-list';
import { createRegistry, Registry } from '../../lib/registry';
import { objectToRoute, CollectionsRoute } from '../../lib/route/types';
import { CollectionsRouteParams } from '../../lib/route/params';
import { EventCallback } from '../../lib/events';
import { API as FakeAPI } from '../fake_api';

describe('Testing collections list view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = createRegistry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture('/collections', {}, 'collections');
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		routeParams: CollectionsRouteParams = {
			filter: '',
			category: null,
		}
	): CollectionsView {
		const registry = setupRegistry();

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Create view
		const view = new CollectionsView(
			registry.id,
			objectToRoute({
				type: 'collections',
				params: routeParams,
			}) as CollectionsRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Do tests
	 */
	it('Creating view', done => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
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
			}) as CollectionsRoute
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
				filter: '',
				category: null,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', done => {
		const view = setupView(data => {
			expect(data).to.be.equal(view);
			done();
		});
	});

	it('Test not found error', done => {
		const registry = createRegistry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('/collections', {}, null);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
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
			}) as CollectionsRoute
		);
		view.startLoading();
	});

	it('Test rendering blocks', done => {
		const view = setupView(data => {
			const blocks = view.render() as NonNullable<CollectionsViewBlocks>;
			expect(blocks).to.not.be.equal(null);

			// Test categories block
			const categories = Object.keys(blocks.categories.filters);
			expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
			categories.forEach(category => {
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
	});

	it('Test filter', done => {
		const view = setupView(
			data => {
				let blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach(category => {
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

				categories.forEach(category => {
					// Everything except 'Emoji' should be enabled
					expect(
						blocks.categories.filters[category].disabled
					).to.be.equal(category === 'Emoji');
				});
				expect(blocks.categories.active).to.be.equal(null);

				done();
			},
			{
				filter: 'mdi',
				category: null,
			}
		);
	});

	it('Test collections', done => {
		const view = setupView(
			data => {
				const blocks = view.render() as NonNullable<
					CollectionsViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test categories block
				const categories = Object.keys(blocks.categories.filters);
				expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);
				categories.forEach(category => {
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
				filter: '32',
				category: 'Thematic',
			}
		);
	});

	/**
	 * Bad data
	 */
	it('Bad data (object)', done => {
		const registry = createRegistry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData(
			'/collections',
			{},
			JSON.stringify({
				error: 'not_found',
			})
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
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
			}) as CollectionsRoute
		);
		view.startLoading();
	});

	it('Bad data (string)', done => {
		const registry = createRegistry(namespace + nsCounter++);
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData('/collections', {}, 'whatever');

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
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
			}) as CollectionsRoute
		);
		view.startLoading();
	});
});
