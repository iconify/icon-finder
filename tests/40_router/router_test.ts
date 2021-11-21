/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import SVGFramework from '@iconify/iconify';
import { setIconify } from '../../lib/iconify';
import { Registry } from '../../lib/registry';
import type { PartialRoute } from '../../lib/route/types/routes';
import {
	API as FakeAPI,
	collectionQueryParams,
	collectionsQueryParams,
	searchQueryParams,
} from '../fake_api';
import type { RouterEvent } from '../../lib/route/router';
import type { FiltersBlock } from '../../lib/blocks/filters';
import type { CollectionViewBlocks } from '../../lib/views/collection';
import { isBlockEmpty } from '../../lib/blocks/types';
import { addProvider, convertProviderData } from '../../lib/data/providers';
import { collectionCacheKey, collectionsCacheKey } from '../../lib/api/base';

// Set SVG Framework
setIconify(SVGFramework);

describe('Testing router', () => {
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

	/**
	 * Do tests
	 */
	it('Creating router, navigating to home', (done) => {
		const registry = setupRegistry();
		const events = registry.events;

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
					// First load - loading page
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load - home page has loaded
					expect(params.route).to.be.eql({
						type: 'collections',
					});
					expect(params.viewChanged).to.be.equal(false);
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

	it('Creating router, navigating to home (synchronous)', (done) => {
		const registry = setupRegistry('', true, true);
		const events = registry.events;
		let isSync = true;

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
			expect(isSync).to.be.equal(true);

			switch (eventCounter) {
				case 1:
					// First load - page has loaded synchronously
					expect(params.route).to.be.eql({
						type: 'collections',
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

		isSync = false;
	});

	it('Custom home route', (done) => {
		const registry = setupRegistry();
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		// Set custom home page
		const config = registry.config;
		config.router!.home = JSON.stringify({
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
		});

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		let collectionsBlock: FiltersBlock | null;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// First load - loading page
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load - home page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections block
					collectionsBlock = (params.blocks as CollectionViewBlocks)
						.collections;
					expect(isBlockEmpty(collectionsBlock)).to.be.equal(true);

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

	it('Loading route from object', (done) => {
		const registry = setupRegistry();
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		const config = registry.config;
		config.ui!.showSiblingCollections = 3;

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		let collectionsBlock: FiltersBlock | null;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// First load - loading page
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load - home page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Test collections block
					collectionsBlock = (params.blocks as CollectionViewBlocks)
						.collections;
					expect(isBlockEmpty(collectionsBlock)).to.be.equal(false);

					expect(
						Object.keys((collectionsBlock as FiltersBlock).filters)
					).to.be.eql([
						// 3 prefixes before "mdi", but because "mdi" is first, it should be 3 last prefixes
						'geo',
						'map',
						'medical-icon',
						// mdi
						'mdi',
						// 3 prefixes after "mdi"
						'mdi-light',
						'ic',
						'uil',
					]);

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to MDI
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		};
	});

	it('Loading route from object (synchronous)', (done) => {
		const registry = setupRegistry('', true, true);
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mdi'),
			'mdi',
			{},
			collectionCacheKey('mdi'),
			true
		);

		const config = registry.config;
		config.ui!.showSiblingCollections = 3;

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		let isSync = true;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.fullRoute).to.be.equal(null);
		expect(router.partialRoute).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Create event listener
		let eventCounter = 0;
		let collectionsBlock: FiltersBlock | null;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;
			expect(isSync).to.be.equal(true);

			switch (eventCounter) {
				case 1:
					// First load - page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');

					// Test collections block
					collectionsBlock = (params.blocks as CollectionViewBlocks)
						.collections;
					expect(isBlockEmpty(collectionsBlock)).to.be.equal(false);

					expect(
						Object.keys((collectionsBlock as FiltersBlock).filters)
					).to.be.eql([
						// 3 prefixes before "mdi", but because "mdi" is first, it should be 3 last prefixes
						'geo',
						'map',
						'medical-icon',
						// mdi
						'mdi',
						// 3 prefixes after "mdi"
						'mdi-light',
						'ic',
						'uil',
					]);

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to MDI
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		};

		isSync = false;
	});

	it('Loading route from object (synchronous, not cached)', (done) => {
		const registry = setupRegistry('', false, true);
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		const config = registry.config;
		config.ui!.showSiblingCollections = 3;

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		let isSync = true;

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
					// First load - page is loading
					expect(isSync).to.be.equal(true);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load (asynchronous) - page has loaded
					expect(isSync).to.be.equal(false);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to MDI
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		};

		isSync = false;
	});

	it('Loading route from object (synchronous, parent view not cached)', (done) => {
		const registry = setupRegistry('', false, true);
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mdi'),
			'mdi',
			{},
			collectionCacheKey('mdi'),
			true
		);

		const config = registry.config;
		config.ui!.showSiblingCollections = 3;

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		let isSync = true;

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
					// First load - page is loading
					expect(isSync).to.be.equal(true);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load (asynchronous) - page has loaded
					expect(isSync).to.be.equal(false);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to MDI
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		};

		isSync = false;
	});

	it('Loading route from object (synchronous, child view not cached)', (done) => {
		const registry = setupRegistry('', true, true);
		const api = registry.api as FakeAPI;
		api.loadFixture('', '/collection', collectionQueryParams('mdi'), 'mdi');

		const config = registry.config;
		config.ui!.showSiblingCollections = 3;

		// Create router and events
		const router = registry.router;
		const events = registry.events;

		let isSync = true;

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
					// First load - page is loading
					expect(isSync).to.be.equal(true);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Second load (asynchronous) - page has loaded
					expect(isSync).to.be.equal(false);
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to MDI
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 2,
			},
			parent: {
				type: 'collections',
			},
		};

		isSync = false;
	});

	it('Creating child view', (done) => {
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

					// Change view to "mdi"
					router.createChildView({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					} as PartialRoute);
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

	it('Creating child view with delay, testing parent view', (done) => {
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

					// Change view to "mdi"
					router.createChildView({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
					} as PartialRoute);
					break;

				case 3:
					// "mdi" is pending
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
					expect(params.error).to.be.equal('loading');
					break;

				case 4:
					// "mdi" has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change to parent view
					router.setParentView(1);
					break;

				case 5:
					// Page was changed to collections
					expect(params.route).to.be.eql({
						type: 'collections',
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

	it('Child view loading faster than parent view, no delay', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/collections',
			collectionsQueryParams(),
			'collections',
			{
				responseDelay: 500,
			}
		);
		api.loadFixture(
			'',
			'/collection',
			collectionQueryParams('mdi'),
			'mdi',
			{
				responseDelay: 10,
			}
		);
		api.loadFixture('', '/collection', collectionQueryParams('el'), 'el', {
			responseDelay: 700,
		});

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
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collection',
							params: {
								prefix: 'el',
							},
							parent: {
								type: 'collections',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// MDI page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'collection',
							params: {
								prefix: 'el',
							},
							parent: {
								type: 'collections',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Navigate to parent page
					router.setParentView();
					break;

				case 3:
					// EL collection, loading. MDI view should not have waited for parent view to load
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'el',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');

					break;

				case 4:
					// EL collection, loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'el',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to mdi
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
			parent: {
				// Add another collection as parent because otherwise mdi will wait for collections list to load
				type: 'collection',
				params: {
					prefix: 'el',
				},
				parent: {
					type: 'collections',
				},
			},
		} as PartialRoute;
	});

	it('Child view loading faster than parent view, with delay', (done) => {
		const registry = setupRegistry();
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const events = registry.events;
		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			searchQueryParams('home', 64),
			'search-home',
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
				responseDelay: 10,
			}
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
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// MDI page has loaded
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Navigate to parent page
					router.setParentView();
					break;

				case 3:
					// Search results, should have been loaded because MDI should have waited for search results
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
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

		// Navigate to search -> mdi
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
			},
			parent: {
				type: 'search',
				params: {
					search: 'home',
					short: true,
				},
			},
		} as PartialRoute;
	});

	it('Creating sibling view and custom provider', (done) => {
		const registry = setupRegistry();
		const events = registry.events;

		const config = registry.config;
		config.ui!.itemsPerPage = 32;

		// Add fake provider to avoid triggering errors
		const provider = 'router-test-' + Date.now();
		addProvider(
			provider,
			convertProviderData('http://localhost', {
				provider: provider,
			})!
		);

		// Add fixtures
		const api = registry.api as FakeAPI;
		api.loadFixture(
			provider,
			'/search',
			searchQueryParams('home', 64),
			'search-home'
		);
		api.loadFixture(
			provider,
			'/search',
			searchQueryParams('home', 999),
			'search-home-full'
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
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							provider,
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
							params: {
								provider,
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Search results have loaded
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							provider,
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
							params: {
								provider,
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change page
					router.createChildView(
						{
							type: 'search',
							params: {
								provider,
								search: 'home',
								page: 2,
								short: false,
							},
						},
						1
					);
					break;

				case 3:
					// Full results
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							provider,
							search: 'home',
							page: 2,
							short: false,
						},
						parent: {
							type: 'collections',
							params: {
								provider,
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

		// Navigate to search results
		router.partialRoute = ({
			type: 'search',
			params: {
				provider,
				search: 'home',
				page: 1,
				short: true,
			},
			parent: {
				type: 'collections',
				params: {
					provider,
				},
			},
		} as unknown) as PartialRoute;
	});
});
