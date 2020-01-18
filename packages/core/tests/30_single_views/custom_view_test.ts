/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import {
	CustomView,
	CustomViewBlocks,
	CustomViewLoadCallback,
	IconsList,
} from '../../lib/views/custom';
import { createRegistry, Registry } from '../../lib/registry';
import {
	objectToRoute,
	CustomRoute,
	PartialRoute,
} from '../../lib/route/types';
import { CustomRouteParams, objectToRouteParams } from '../../lib/route/params';
import { EventCallback } from '../../lib/events';
import { Icon, stringToIcon, iconToString } from '../../lib/icon';
import { IconsListBlock } from '../../lib/blocks/icons-list';
import { isSearchBlockEmpty } from '../../lib/blocks/search';
import { PaginationBlock } from '../../lib/blocks/pagination';

describe('Testing custom view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Convert array of strings to array of icons
	 */
	function convertIcons(icons: string[]): IconsList {
		return icons.map(item => stringToIcon(item));
	}

	/**
	 * Setup registry for test
	 */
	function setupRegistry(): Registry {
		const registry = createRegistry(namespace + nsCounter++);

		// Change pagination limit for tests to 32
		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		routeParams: Partial<CustomRouteParams> | null = null,
		icons: string[] | null = null
	): CustomView {
		const registry = setupRegistry();

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Set icons
		if (icons !== null) {
			events.subscribe('load-recent', param => {
				const callback = param as CustomViewLoadCallback;
				callback(convertIcons(icons));
			});
		}

		// Merge params
		const params = objectToRouteParams(
			'custom',
			Object.assign({}, routeParams === null ? {} : routeParams, {
				customType: 'recent',
			})
		) as CustomRouteParams;

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: params,
			}) as CustomRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Get icon names from block
	 */
	function getIconNames(block: IconsListBlock): string[] {
		return (block.icons as Icon[]).map(icon => iconToString(icon));
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

			const view = data as CustomView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Event to send data
		events.subscribe('load-recent', param => {
			const callback = param as CustomViewLoadCallback;
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
			} as PartialRoute) as CustomRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
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
	});

	it('Creating view, not using events, icons as strings', done => {
		const registry = setupRegistry();

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as CustomView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);
		});

		// Event to send data
		events.subscribe('load-recent', param => {
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
			} as PartialRoute) as CustomRoute
		);
		view.startLoading();

		// Set icons as strings
		view.setIcons(['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4']);

		// This view is loaded synchronously!
		expect(view.loading).to.be.equal(false);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(true);

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

		done();
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', done => {
		const view = setupView(
			data => {
				expect(data).to.be.equal(view);
				done();
			},
			null,
			['foo-bar', 'foo-bar2', 'foo-bar3', 'foo-bar4']
		);
	});

	it('Not found', done => {
		const registry = setupRegistry();

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
			const view = data as CustomView;
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);
			done();
		});

		// Event to send data
		events.subscribe('load-recent', param => {
			(param as (data: unknown) => void)(null);
		});

		// Create view
		const view = new CustomView(
			registry.id,
			objectToRoute({
				type: 'custom',
				params: {
					customType: 'recent',
				},
			} as PartialRoute) as CustomRoute
		);
		view.startLoading();
	});

	it('Simple set of icons', done => {
		const view = setupView(
			data => {
				expect(data).to.be.equal(view);

				// Check view
				expect(view.error).to.be.equal('');

				const blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.search.keyword).to.be.equal('');
				expect(isSearchBlockEmpty(blocks.search)).to.be.equal(true);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 4,
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

	it('Filter and updating icons', done => {
		const view = setupView(
			data => {
				expect(data).to.be.equal(view);

				// Check view
				expect(view.error).to.be.equal('');

				let blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.search.keyword).to.be.equal('arrow');
				expect(isSearchBlockEmpty(blocks.search)).to.be.equal(false);

				// Pagination
				const expectedPagination: PaginationBlock = {
					type: 'pagination',
					length: 2,
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

				expect(blocks.search.keyword).to.be.equal('mdi');

				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['mdi:home', 'mdi:arrows']);

				/**
				 * Filter by prefix and name
				 */
				view.route.params.filter = 'mdi:home';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CustomViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				expect(blocks.search.keyword).to.be.equal('mdi:home');

				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['mdi:home']);

				done();
			},
			{
				filter: 'arrow',
			},
			['mdi:home', 'fa:arrow-left', 'ion:home', 'mdi:arrows']
		);
	});
});
