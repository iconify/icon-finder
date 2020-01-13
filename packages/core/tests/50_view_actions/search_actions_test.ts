/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import { createRegistry, Registry } from '../../lib/registry';
import { PartialRoute } from '../../lib/route/types';
import { API as FakeAPI } from '../fake_api';
import { RouterEvent } from '../../lib/route/router';
import { SearchViewBlocks } from '../../lib/views/search';

describe('Testing search actions', () => {
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

	it('Pagination with "more"', done => {
		const registry = setupRegistry();
		const events = registry.events;

		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
		);
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 999,
			},
			'search-home-full'
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
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
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
							search: 'home',
							page: 1,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change page
					router.action('pagination', 2);
					break;

				case 3:
					// Full results
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							page: 2,
							short: false,
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

		// Navigate to search results
		router.route = ({
			type: 'search',
			params: {
				search: 'home',
				page: 1,
				short: true,
			},
			parent: {
				type: 'collections',
			},
		} as unknown) as PartialRoute;
	});

	it('"search" action', done => {
		const registry = setupRegistry();
		const events = registry.events;

		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 64,
			},
			'search-home'
		);
		api.loadFixture(
			'/search',
			{
				query: 'nav',
				limit: 64,
			},
			'search-nav'
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
						type: 'search',
						params: {
							search: 'home',
						},
						parent: {
							type: 'collections',
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
							search: 'home',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change search
					router.action('search', 'nav');
					break;

				case 3:
					// Second search
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

		// Navigate to search results
		router.route = ({
			type: 'search',
			params: {
				search: 'home',
			},
			parent: {
				type: 'collections',
			},
		} as unknown) as PartialRoute;
	});

	it('"pagination" action', done => {
		const registry = setupRegistry();
		const events = registry.events;

		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		const api = registry.api as FakeAPI;
		api.loadFixture(
			'/search',
			{
				query: 'home',
				limit: 999,
			},
			'search-home-full'
		);

		// Create router
		const router = registry.router;

		// Create event listener
		let eventCounter = 0;
		let blocks: SearchViewBlocks;
		events.subscribe('render', data => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							short: false,
							page: 1,
						},
						parent: {
							type: 'collections',
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
							search: 'home',
							short: false,
							page: 1,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check blocks
					blocks = params.blocks as SearchViewBlocks;
					expect(blocks.pagination).to.be.eql({
						length: 86,
						page: 1,
						more: false,
						perPage: 32,
					});
					expect(blocks.icons.icons.length).to.be.equal(32);

					// Change page
					router.action('pagination', 2);
					break;

				case 3:
					// Second search
					expect(params.route).to.be.eql({
						type: 'search',
						params: {
							search: 'home',
							short: false,
							page: 2,
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check blocks
					blocks = params.blocks as SearchViewBlocks;
					expect(blocks.pagination).to.be.eql({
						length: 86,
						page: 2,
						more: false,
						perPage: 32,
					});
					expect(blocks.icons.icons.length).to.be.equal(22); // 86 - 32*2

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to search results
		router.route = ({
			type: 'search',
			params: {
				search: 'home',
				short: false,
				page: 1,
			},
			parent: {
				type: 'collections',
			},
		} as unknown) as PartialRoute;
	});
});
