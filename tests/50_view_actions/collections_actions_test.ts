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
	searchQueryParams,
} from '../fake_api';
import type { RouterEvent } from '../../lib/route/router';
import type { CollectionsViewBlocks } from '../../lib/views/collections';
import { getCollectionsBlockPrefixes } from '../../lib/blocks/collections-list';
import type { FiltersBlock } from '../../lib/blocks/filters';
import type { CollectionViewBlocks } from '../../lib/views/collection';
import { isBlockEmpty } from '../../lib/blocks/types';
import { addProvider, convertProviderData } from '../../lib/data/providers';
import { collectionsCacheKey, searchCacheKey } from '../../lib/api/base';

// Set SVG Framework
setIconify(SVGFramework);

describe('Testing collections actions', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(
		provider = '',
		cache = false,
		sync = false
	): Registry {
		const registry = new Registry(namespace + nsCounter++);
		if (sync) {
			// Synchronous test
			const config = registry.config;
			config.router.syncRender = true;
		}

		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			provider,
			'/collections',
			collectionsQueryParams(),
			'collections',
			{},
			collectionsCacheKey(),
			cache
		);
		return registry;
	}

	it('Navigating to collection', (done) => {
		const registry = setupRegistry();
		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

	it('Navigating to hidden collection', (done) => {
		const registry = setupRegistry();
		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mono-icons'),
			'mono-icons'
		);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

					// Change view to "mono-icons"
					router.action('collections', 'mono-icons');
					break;

				case 3:
					// "mono-icons" has loaded
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mono-icons',
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

	it('Changing provider', (done) => {
		const provider = 'testing-provider';
		const registry = setupRegistry();
		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			provider,
			'/collections',
			collectionsQueryParams(),
			'collections'
		);

		// Add provider
		const providerData = convertProviderData('https://localhost', {
			provider,
			api: 'https://localhost',
		});
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		addProvider(provider, providerData!);

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

					// Change provider
					router.action('provider', provider);
					break;

				case 3:
					// New provider
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collections',
						params: {
							provider,
						},
					});
					break;

				case 4:
					// New provider has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collections',
						params: {
							provider,
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

	it('"collections" and "parent" actions', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mdi'),
			'mdi',
			{
				responseDelay: 200,
			}
		);

		// Create router
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

	it('"collections" before home page has loaded', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 50;
		config.ui!.showSiblingCollections = 3;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collections',
			collectionsQueryParams(),
			'collections',
			{
				responseDelay: 300,
			}
		);
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mdi'),
			'mdi',
			{
				responseDelay: 0,
			}
		);
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('ant-design'),
			'ant-design',
			{
				responseDelay: 0,
			}
		);

		// Create router
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		let collectionsBlock: FiltersBlock | null;
		events.subscribe('render', (data: unknown) => {
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

					// Set filter to "24" to test collections block in mdi
					router.action('filter', '24');

					// Change view to "mdi"
					router.action('collections', 'mdi');
					break;

				case 2:
					// "mdi" should wait for parent unless parent view is search
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
							params: {
								filter: '24',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 3:
					// "mdi" has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
							params: {
								filter: '24',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections block
					collectionsBlock = (params.blocks as CollectionViewBlocks)
						.collections;

					expect(isBlockEmpty(collectionsBlock)).to.be.equal(false);

					expect(
						(collectionsBlock as FiltersBlock).active
					).to.be.equal('mdi');

					// Collections should include only icon sets with 24px grid
					expect(
						Object.keys((collectionsBlock as FiltersBlock).filters)
					).to.be.eql([
						// 3 items before "mdi", but "mdi" is first, so 3 last items
						'fe',
						'typcn',
						'simple-icons',
						// mdi
						'mdi',
						// 3 items after "mdi"
						'mdi-light',
						'ic',
						'uil',
					]);

					// Change collection to ant-design. It is not in filters list, but action should work anyway
					router.action('collections', 'ant-design');

					break;

				case 4:
					// "ant-design" should have loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'ant-design',
						},
						parent: {
							type: 'collections',
							params: {
								filter: '24',
							},
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

	it('"collections" action with invalid collection', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		const events = registry.events;
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

	it('"search" action', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			searchQueryParams('home', 64),
			'search-home'
		);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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

	it('"filter" and "categories" actions', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			searchQueryParams('home', 64),
			'search-home'
		);

		// Create event listener
		let eventCounter = 0;
		let blocks: CollectionsViewBlocks;
		events.subscribe('render', (data: unknown) => {
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

	it('"filter" and "categories" actions (synchronous)', (done) => {
		const registry = setupRegistry('', true, true);
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			searchQueryParams('home', 64),
			'search-home',
			{},
			searchCacheKey('home', 64),
			true
		);

		// Create event listener
		let eventCounter = 0;
		let isSync = true;
		let blocks: CollectionsViewBlocks;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;

			// Everything is cached, so all calls should be synchronous
			expect(isSync).to.be.equal(true);

			switch (eventCounter) {
				case 1:
					// Home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
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

				case 2:
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

					// Apply 2 actions at the same time, 2 event calls
					router.action('filter', '24');
					router.action('categories', 'Thematic');

					expect(eventCounter).to.be.equal(3);
					break;

				case 3:
					// Only filter should have changed
					expect(params.route).to.be.eql({
						type: 'collections',
						params: {
							filter: '24',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					break;

				case 4:
					// Filter and category should have changed
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

		isSync = false;
	});

	it('"search" action', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const events = registry.events;
		const router = registry.router;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			searchQueryParams('nav', 64),
			'search-nav'
		);

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data: unknown) => {
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
