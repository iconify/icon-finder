/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import { Registry } from '../../lib/registry';
import { API as FakeAPI } from '../fake_api';
import type { RouterEvent } from '../../lib/route/router';
import type { CollectionViewBlocks } from '../../lib/views/collection';
import { isPaginationEmpty } from '../../lib/blocks/pagination';
import type { FiltersBlock } from '../../lib/blocks/filters';

describe('Testing collection actions', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(prefix: string): Registry {
		const registry = new Registry(namespace + nsCounter++);

		const config = registry.config;
		config.ui!.itemsPerPage = 48;

		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture('', '/collections', {}, 'collections');
		api.loadFixture(
			'',
			'/collection',
			{
				prefix: prefix,
				info: 'true',
				chars: 'true',
			},
			prefix
		);
		return registry;
	}

	it('"pagination", "filter" and "tags" actions', (done) => {
		const registry = setupRegistry('mdi');
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
		let blocks: CollectionViewBlocks;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 1000, // page remains invalid until data has been loaded
						},
						parent: {
							type: 'collections',
						},
					});
					break;

				case 2:
					// Home page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 96, // page should be fixed
						},
						parent: {
							type: 'collections',
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(13); // number of icons on last page
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						false
					);

					// Change page as string
					router.action('pagination', '20');
					break;

				case 3:
					// Pagination action has been applied
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							page: 20, // page should be fixed
						},
						parent: {
							type: 'collections',
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(48); // full page
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						false
					);

					// Filter icons
					router.action('filter', 'auto');
					break;

				case 4:
					// Filter action has been applied
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							filter: 'auto',
						},
						parent: {
							type: 'collections',
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(12); // only 12 icons match
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						true
					);

					// Change filter, set page and tags
					router.action('filter', 'outline');
					router.action('page', 5);
					router.action('tags', 'Alert / Error');
					break;

				case 5:
					// Mulitple actions has been applied
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							filter: 'outline',
							tag: 'Alert / Error',
						},
						parent: {
							type: 'collections',
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(28); // full page
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						true
					);

					// Reset tag
					router.action('tags', null);
					break;

				case 6:
					// Tag should be empty
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							filter: 'outline',
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

		// Navigate to collection
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'mdi',
				page: 1000, // unreasonably high page
			},
			parent: {
				type: 'collections',
			},
		};
	});

	it('"collections" action', (done) => {
		const registry = setupRegistry('el');
		const events = registry.events;
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home',
			{
				responseDelay: 300,
			}
		);
		api.loadFixture(
			'',
			'/collection',
			{
				prefix: 'mdi',
				info: 'true',
				chars: 'true',
			},
			'mdi'
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
		let blocks: CollectionViewBlocks;
		let collectionsBlock: FiltersBlock;
		events.subscribe('render', (data: unknown) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'el',
							filter: 'home',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});
					break;

				case 2:
					// Main page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'el',
							filter: 'home',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(3); // number of icons
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						true
					);

					// Check collections block
					expect(blocks.collections).to.not.be.equal(null);

					collectionsBlock = blocks.collections as FiltersBlock;
					expect(collectionsBlock.active).to.be.equal('el');

					// Change collection
					router.action('collections', 'mdi');
					break;

				case 3:
					// "mdi" view should have loaded
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'mdi',
							filter: 'home',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
						},
					});

					// Check icons block
					blocks = params.blocks as CollectionViewBlocks;
					expect(blocks.icons.icons.length).to.be.equal(32); // 32+, but limited by page
					expect(isPaginationEmpty(blocks.pagination)).to.be.equal(
						false
					);
					expect(blocks.pagination.length).to.be.equal(44);

					// Check collections block
					expect(blocks.collections).to.not.be.equal(null);

					collectionsBlock = blocks.collections as FiltersBlock;
					expect(collectionsBlock.active).to.be.equal('mdi');

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to collection
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'el',
				filter: 'home',
			},
			parent: {
				type: 'search',
				params: {
					search: 'home',
				},
			},
		};
	});

	it('"search" action', (done) => {
		const registry = setupRegistry('ant-design');
		const events = registry.events;
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			{
				query: 'nav',
				limit: 64,
			},
			'search-nav'
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
						type: 'collection',
						params: {
							prefix: 'ant-design',
						},
						parent: {
							type: 'collections',
						},
					});
					break;

				case 2:
					// Main page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'ant-design',
						},
						parent: {
							type: 'collections',
						},
					});

					// Search
					router.action('search', 'nav');
					break;

				case 3:
					// "search" view should have loaded
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'nav',
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

		// Navigate to collection
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'ant-design',
			},
			parent: {
				type: 'collections',
			},
		};
	});

	it('"search" action, 2 levels', (done) => {
		const registry = setupRegistry('ant-design');
		const events = registry.events;
		const config = registry.config;
		config.ui!.viewUpdateDelay = 100;
		config.ui!.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'',
			'/search',
			{
				query: 'nav',
				limit: 64,
			},
			'search-nav'
		);
		api.loadFixture(
			'',
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
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
						type: 'collection',
						params: {
							prefix: 'ant-design',
							filter: 'home',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
							parent: {
								type: 'collections',
							},
						},
					});
					break;

				case 2:
					// Main page has loaded
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'collection',
						params: {
							prefix: 'ant-design',
							filter: 'home',
						},
						parent: {
							type: 'search',
							params: {
								search: 'home',
							},
							parent: {
								type: 'collections',
							},
						},
					});

					// Search
					router.action('search', 'nav');
					break;

				case 3:
					// "search" view should have loaded
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('');
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'nav',
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

		// Navigate to collection
		router.partialRoute = {
			type: 'collection',
			params: {
				prefix: 'ant-design',
				filter: 'home',
			},
			parent: {
				type: 'search',
				params: {
					search: 'home',
				},
				parent: {
					type: 'collections',
				},
			},
		};
	});
});
