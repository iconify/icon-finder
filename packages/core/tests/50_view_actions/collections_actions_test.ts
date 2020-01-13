import 'mocha';
import { expect } from 'chai';
import { createRegistry, Registry } from '../../lib/registry';
import { API as FakeAPI } from '../fake_api';
import { RouterEvent } from '../../lib/route/router';
import { CollectionsViewBlocks } from '../../lib/views/collections';
import { getCollectionsBlockPrefixes } from '../../lib/blocks/collections-list';

describe('Testing collections actions', () => {
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

	it('Navigating to collection', done => {
		const registry = setupRegistry();
		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/collection',
			{
				prefix: 'mdi',
			},
			'mdi'
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					break;

				case 2:
					// Home page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collections',
					});

					// Change view to "mdi"
					router.action('collections', 'mdi');
					break;

				case 3:
					// "mdi" has loaded
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"collections" and "parent" actions', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/collection',
			{
				prefix: 'mdi',
			},
			'mdi',
			{
				responseDelay: 200,
			}
		);

		// Create router
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					break;

				case 2:
					// Home page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collections',
					});

					// Change view to "mdi"
					router.action('collections', 'mdi');
					break;

				case 3:
					// "mdi" is pending
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					break;

				case 4:
					// "mdi" has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});

					// Change to parent view
					router.action('parent', 1);
					break;

				case 5:
					// Page was changed to collections
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collections',
					});

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"collections" before home page has loaded', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 50;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture('/collections', {}, 'collections', {
			responseDelay: 300,
		});
		api.loadFixture(
			'/collection',
			{
				prefix: 'mdi',
			},
			'mdi',
			{
				responseDelay: 0,
			}
		);

		// Create router
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');

					// Change view to "mdi"
					router.action('collections', 'mdi');
					break;

				case 2:
					// "mdi" has been loaded because it should not wait for parent unless parent view is search
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"collections" action with invalid collection', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;
		const events = registry.events;
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change view to "foo" that does not exist
					router.action('collections', 'foo');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"search" action', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;
		config.data.display.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
		);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Search for "home"
					router.action('search', 'home');
					break;

				case 3:
					// Search page has loaded
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"filter" and "categories" actions', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;
		config.data.display.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
		);

		// Create event listener
		let eventCounter = 0;
		let blocks: CollectionsViewBlocks;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections blocks
					blocks = params.blocks as CollectionsViewBlocks;
					expect(blocks).to.not.be.equal(null);

					expect(
						getCollectionsBlockPrefixes(blocks.collections).length
					).to.be.equal(62);

					// Filter collections
					router.action('filter', 'mdi');
					break;

				case 3:
					// Page has been updated
					expect(params.route).to.be.eql({
						type: 'collections',
						params: {
							filter: 'mdi',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections blocks
					blocks = params.blocks as CollectionsViewBlocks;
					expect(blocks).to.not.be.equal(null);

					expect(
						getCollectionsBlockPrefixes(blocks.collections)
					).to.be.eql(['mdi', 'mdi-light', 'zmdi']);

					// Apply 2 actions at the same time, next event should be asynchronous
					router.action('filter', '24');
					router.action('categories', 'Thematic');

					expect(eventCounter).to.be.equal(3);

					break;

				case 4:
					// Page has been updated
					expect(params.route).to.be.eql({
						type: 'collections',
						params: {
							filter: '24',
							category: 'Thematic',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections blocks
					blocks = params.blocks as CollectionsViewBlocks;
					expect(blocks).to.not.be.equal(null);

					expect(
						getCollectionsBlockPrefixes(blocks.collections)
					).to.be.eql(['simple-icons']);

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});

	it('"search" action', done => {
		const registry = setupRegistry();
		const config = registry.config;
		config.data.display.viewUpdateDelay = 100;
		config.data.display.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'nav',
				limit: 64,
			},
			'search-nav'
		);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Home page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Search
					router.action('search', 'nav');
					break;

				case 3:
					// Oage should be changed to search
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'nav',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to home
		router.home();
	});
});
