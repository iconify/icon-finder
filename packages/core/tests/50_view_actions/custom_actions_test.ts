/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import { Registry } from '../../lib/registry';
import { API as FakeAPI } from '../fake_api';
import { PartialRoute } from '../../lib/route/types';
import { RouterEvent } from '../../lib/route/router';
import {
	CustomViewLoadCallback,
	CustomViewBlocks,
} from '../../lib/views/custom';
import {
	isIconsListBlockEmpty,
	IconsListBlock,
} from '../../lib/blocks/icons-list';
import { Icon, iconToString } from '../../lib/icon';

describe('Testing custom actions', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = new Registry(namespace + nsCounter++);

		const config = registry.config;
		config.ui!.itemsPerPage = 32;
		config.ui!.viewUpdateDelay = 50;

		return registry;
	}

	/**
	 * Get icon names from block
	 */
	function getIconNames(block: IconsListBlock): string[] {
		return (block.icons as Icon[]).map((icon) => iconToString(icon));
	}

	/**
	 * Do tests
	 */
	it('"pagination", "filter" and "set" actions', (done) => {
		const registry = setupRegistry();
		const events = registry.events;

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Generate icons
		events.subscribe('load-recent', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 100; i++) {
				// Even icons are "icon-", odd icons are "arrow-"
				icons.push('foo:icon-' + i * 2);
				icons.push('foo:arrow-' + (i * 2 + 1));
			}

			(callback as CustomViewLoadCallback)(icons);
		});

		// Create event listener
		let eventCounter = 0;
		let blocks: CustomViewBlocks;
		let icons: string[];
		events.subscribe('render', (data) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Page has been loaded
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check icons block
					blocks = params.blocks as CustomViewBlocks;
					expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(
						false
					);

					icons = getIconNames(blocks.icons);
					expect(icons.length).to.be.equal(32);
					expect(icons[0]).to.be.equal('foo:icon-0');
					expect(icons[31]).to.be.equal('foo:arrow-31');

					// Change page
					router.action('pagination', 10);
					break;

				case 3:
					// Updated page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
							page: 6, // maximum page = 6 (total = 32 * 6 + 8)
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check icons block
					blocks = params.blocks as CustomViewBlocks;
					expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(
						false
					);

					icons = getIconNames(blocks.icons);
					expect(icons.length).to.be.equal(8);
					expect(icons[0]).to.be.equal('foo:icon-192');
					expect(icons[7]).to.be.equal('foo:arrow-199');

					// Change filter
					router.action('filter', 'arrow');
					break;

				case 4:
					// Updated page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
							page: 3, // maximum page = 3 (total = 100 = 32 * 3 + 4)
							filter: 'arrow',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check icons block
					blocks = params.blocks as CustomViewBlocks;
					expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(
						false
					);

					icons = getIconNames(blocks.icons);
					expect(icons.length).to.be.equal(4);
					expect(icons[0]).to.be.equal('foo:arrow-193');
					expect(icons[3]).to.be.equal('foo:arrow-199');

					// Change icons. Generate 320 icons
					icons = [];
					for (let i = 0; i < 80; i++) {
						// Rotate names
						icons.push('bar:icon-' + i * 4);
						icons.push('bar:arrow-' + (i * 4 + 1));
						icons.push('bar:arrows-' + (i * 4 + 2));
						icons.push('bar:home-' + (i * 4 + 3));
					}
					router.action('set', icons);
					break;

				case 5:
					// Updated page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
							page: 3,
							filter: 'arrow',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Check icons block
					blocks = params.blocks as CustomViewBlocks;
					expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(
						false
					);

					icons = getIconNames(blocks.icons);
					expect(icons.length).to.be.equal(32);
					expect(icons[0]).to.be.equal('bar:arrow-193');
					expect(icons[31]).to.be.equal('bar:arrows-254');

					// Parent action: should do nothing because there is no parent view
					router.action('parent', 1);

					done();
					break;

				default:
					done(
						`Render event should have been called less than ${eventCounter} times!`
					);
			}
		});

		// Navigate to custom page
		router.route = ({
			type: 'custom',
			params: {
				customType: 'recent',
			},
		} as unknown) as PartialRoute;
	});

	it('"parent" action', (done) => {
		const registry = setupRegistry();
		const events = registry.events;

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Generate icons
		events.subscribe('load-recent', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 100; i++) {
				// Even icons are "icon-", odd icons are "arrow-"
				icons.push('foo:icon-' + i * 2);
				icons.push('foo:arrow-' + (i * 2 + 1));
			}

			(callback as CustomViewLoadCallback)(icons);
		});
		events.subscribe('load-favorites', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 10; i++) {
				icons.push('foo:favicon-' + i);
			}

			(callback as CustomViewLoadCallback)(icons);
		});
		events.subscribe('load-bookmarks', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 20; i++) {
				icons.push('foo:bookmark-' + i);
			}

			(callback as CustomViewLoadCallback)(icons);
		});

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
						parent: {
							type: 'custom',
							params: {
								customType: 'favorites',
							},
							parent: {
								type: 'custom',
								params: {
									customType: 'bookmarks',
								},
							},
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Page has been loaded
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
						parent: {
							type: 'custom',
							params: {
								customType: 'favorites',
							},
							parent: {
								type: 'custom',
								params: {
									customType: 'bookmarks',
								},
							},
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change view by 2 levels up
					router.action('parent', 2);
					break;

				case 3:
					// Updated route
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'bookmarks',
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

		// Navigate to custom page
		router.route = ({
			type: 'custom',
			params: {
				customType: 'recent',
			},
			parent: {
				type: 'custom',
				params: {
					customType: 'favorites',
				},
				parent: {
					type: 'custom',
					params: {
						customType: 'bookmarks',
					},
				},
			},
		} as unknown) as PartialRoute;
	});

	it('"parent" action with collections', (done) => {
		const registry = setupRegistry();
		const events = registry.events;

		// Load collections
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture('', '/collections', {}, 'collections', {
			responseDelay: 300,
		});

		// Create router
		const router = registry.router;

		// Check for data
		expect(router.error()).to.be.equal('loading');
		expect(router.route).to.be.equal(null);
		expect(router.render()).to.be.equal(null);

		// Generate icons
		events.subscribe('load-recent', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 100; i++) {
				// Even icons are "icon-", odd icons are "arrow-"
				icons.push('foo:icon-' + i * 2);
				icons.push('foo:arrow-' + (i * 2 + 1));
			}

			(callback as CustomViewLoadCallback)(icons);
		});
		events.subscribe('load-favorites', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 10; i++) {
				icons.push('foo:favicon-' + i);
			}

			(callback as CustomViewLoadCallback)(icons);
		});
		events.subscribe('load-bookmarks', (callback) => {
			const icons: string[] = [];

			for (let i = 0; i < 20; i++) {
				icons.push('foo:bookmark-' + i);
			}

			(callback as CustomViewLoadCallback)(icons);
		});

		// Create event listener
		let eventCounter = 0;
		events.subscribe('render', (data) => {
			const params = data as RouterEvent;
			eventCounter++;

			switch (eventCounter) {
				case 1:
					// Loading page
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(true);
					expect(params.error).to.be.equal('loading');
					break;

				case 2:
					// Page has been loaded
					expect(params.route).to.be.eql({
						type: 'custom',
						params: {
							customType: 'recent',
						},
						parent: {
							type: 'collections',
						},
					});
					expect(params.viewChanged).to.be.equal(false);
					expect(params.error).to.be.equal('');

					// Change view
					router.action('parent', 1);
					break;

				case 3:
					// Updated route - should have been loaded
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

		// Navigate to custom page
		router.route = ({
			type: 'custom',
			params: {
				customType: 'recent',
			},
			parent: {
				type: 'collections',
			},
		} as unknown) as PartialRoute;
	});
});
