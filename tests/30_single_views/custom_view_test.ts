/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'mocha';
import { expect } from 'chai';
import type {
	CustomViewBlocks,
	CustomViewLoadCallback,
	IconsList,
} from '../../lib/views/custom';
import { CustomView } from '../../lib/views/custom';
import { Registry } from '../../lib/registry';
import type { FullCustomRoute } from '../../lib/route/types/routes';
import { objectToRoute, objectToRouteParams } from '../../lib/route/convert';
import type {
	FullCustomRouteParams,
	PartialCustomRouteParams,
} from '../../lib/route/types/params';
import type { EventCallback } from '../../lib/events';
import type { Icon } from '../../lib/misc/icon';
import { stringToIcon, iconToString } from '../../lib/misc/icon';
import type { IconsListBlock } from '../../lib/blocks/icons-list';
import { isSearchBlockEmpty } from '../../lib/blocks/search';
import type { PaginationBlock } from '../../lib/blocks/pagination';

describe('Testing custom view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Convert array of strings to array of icons
	 */
	function convertIcons(icons: string[]): IconsList {
		return icons.map((item) => stringToIcon(item));
	}

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = new Registry(namespace + nsCounter++);

		// Change pagination limit for tests to 32
		const config = registry.config;
		config.ui!.itemsPerPage = 32;

		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		routeParams: PartialCustomRouteParams | null = null,
		icons: string[] | null = null,
		sync = false
	): CustomView {
		const registry = setupRegistry();

		// Change config
		if (sync) {
			// Synchronous test
			const config = registry.config;
			config.router.syncRender = true;
		}

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Set icons
		if (icons !== null) {
			events.subscribe('load-recent', (data: unknown) => {
				const callback = data as CustomViewLoadCallback;
				callback(convertIcons(icons));
			});
		}

		// Merge params
		const params = objectToRouteParams(
			'custom',
			Object.assign({}, routeParams === null ? {} : routeParams, {
				customType: 'recent',
			})
		) as FullCustomRouteParams;

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: params,
			}) as FullCustomRoute
		);
		view.startLoading();

		return view;
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
	it('Creating view', (done) => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;
		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			expect(isSync).to.be.equal(false);
			loaded = true;

			const view = data as CustomView;

			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);
			expect(view.getIcons()).to.be.eql(
				convertIcons(['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4'])
			);

			done();
		});

		// Event to send data
		events.subscribe('load-recent', (data: unknown) => {
			const callback = data as CustomViewLoadCallback;
			callback(
				convertIcons(['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4'])
			);
		});

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: {
					customType: 'recent',
				},
			}) as FullCustomRoute
		);

		// Test getIcons()
		expect(view.getIcons()).to.be.equal(null);

		// Start loading
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);
		expect(view.getIcons()).to.be.equal(null);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'custom',
			params: {
				customType: 'recent',
				filter: '',
				page: 0,
			},
			parent: null,
		});

		isSync = false;
	});

	it('Creating view, not using events, icons as strings', (done) => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;
		let isSync = true;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			expect(isSync).to.be.equal(false);

			const view = data as CustomView;

			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Event to send data
		events.subscribe('load-recent', () => {
			done('load-recent should not be called');
		});

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: {
					customType: 'recent',
				},
			}) as FullCustomRoute
		);
		// view.startLoading();

		// Set icons as strings
		view.setIcons(['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4']);

		// This view is loaded asynchronously
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'custom',
			params: {
				customType: 'recent',
				filter: '',
				page: 0,
			},
			parent: null,
		});

		isSync = false;
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', (done) => {
		let isSync = true;
		const view = setupView(
			(data: unknown) => {
				expect(isSync).to.be.equal(false);
				expect(data).to.be.equal(view);
				done();
			},
			null,
			['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4']
		);
		isSync = false;
	});

	it('Test using setupView code (synchronous)', (done) => {
		let isSync = true;
		const view = setupView(
			(data: unknown) => {
				expect(isSync).to.be.equal(true);
				// Test stuff on next tick to allow 'view' variable to initialise
				setTimeout(() => {
					expect(data).to.be.equal(view);
					done();
				});
			},
			null,
			['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4'],
			true
		);
		isSync = false;
	});

	it('Not found', (done) => {
		const registry = setupRegistry();

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', (data: unknown) => {
			const view = data as CustomView;

			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);
			done();
		});

		// Event to send data
		events.subscribe('load-recent', (data: unknown) => {
			const callback = data as CustomViewLoadCallback;
			callback((null as unknown) as IconsList);
		});

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: {
					customType: 'recent',
				},
			}) as FullCustomRoute
		);
		view.startLoading();
	});

	it('Simple set of icons', (done) => {
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Check view
				expect(view.error).to.be.equal('');

				const blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');
				expect(isSearchBlockEmpty(blocks.filter)).to.be.equal(true);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 4,
					fullLength: 4,
					more: false,
					page: 0,
					perPage: 32,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Check icons
				expect(blocks.icons.icons.length).to.be.equal(4);
				const iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql([
					'foo:bar',
					'foo:bar2',
					'foo:bar3',
					'foo:bar4',
				]);

				done();
			},
			null,
			['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4']
		);
	});

	it('Filter and updating icons', (done) => {
		const view = setupView(
			(data: unknown) => {
				expect(data).to.be.equal(view);

				// Check view
				expect(view.error).to.be.equal('');

				let blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('arrow');
				expect(isSearchBlockEmpty(blocks.filter)).to.be.equal(false);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 2,
					fullLength: 4,
					more: false,
					page: 0,
					perPage: 32,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				// Check icons
				expect(blocks.icons.icons.length).to.be.equal(2);
				let iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['fa:arrow-left', 'mdi:arrows']);

				/**
				 * Change filter to "mdi"
				 */
				view.route.params.filter = 'mdi';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				expect(blocks.filter.keyword).to.be.equal('mdi');

				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['mdi:home', 'mdi:arrows']);

				/**
				 * Filter by prefix and name
				 */
				view.route.params.filter = 'mdi:home';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				expect(blocks.filter.keyword).to.be.equal('mdi:home');

				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['mdi:home']);

				done();
			},
			{
				customType: 'test',
				filter: 'arrow',
			},
			['mdi:home', 'fa:arrow-left', 'ion:home', 'mdi:arrows']
		);
	});
});
