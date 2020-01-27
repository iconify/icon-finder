/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import { SearchView, SearchViewBlocks } from '../../lib/views/search';
import { Registry } from '../../lib/registry';
import {
	objectToRoute,
	SearchRoute,
	PartialRoute,
} from '../../lib/route/types';
import { SearchRouteParams, objectToRouteParams } from '../../lib/route/params';
import { API as FakeAPI } from '../fake_api';
import { EventCallback } from '../../lib/events';
import { FiltersBlock, isFiltersBlockEmpty } from '../../lib/blocks/filters';
import { Icon } from '../../lib/icon';
import {
	IconsListBlock,
	isIconsListBlockEmpty,
} from '../../lib/blocks/icons-list';
import {
	isPaginationEmpty,
	PaginationBlock,
} from '../../lib/blocks/pagination';

describe('Testing search view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(search: string, short = true): Registry {
		const registry = new Registry(namespace + nsCounter++);

		// Change pagination limit for tests to 32
		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		// Change API to fake API and load fixture
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			'/search',
			{
				query: search,
				limit: short ? 64 : 999,
			},
			'search-' + search + (short ? '' : '-full')
		);
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		search: string,
		short = true,
		routeParams: Partial<SearchRouteParams> | null = null
	): SearchView {
		const registry = setupRegistry(search, short);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Merge params
		const params = objectToRouteParams(
			'search',
			Object.assign({}, routeParams === null ? {} : routeParams, {
				search,
				short,
			})
		) as SearchRouteParams;

		// Create view
		const view = new SearchView(
			registry.id,
			objectToRoute({
				type: 'search',
				params: params,
			}) as SearchRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Get icon names from block
	 */
	function getIconNames(block: IconsListBlock): string[] {
		return (block.icons as Icon[]).map(icon => {
			return icon.name;
		});
	}

	/**
	 * Filter tags
	 */
	function filterTags(block: FiltersBlock, disabled: boolean): string[] {
		return Object.keys(block.filters).filter(
			key => block.filters[key].disabled === disabled
		);
	}

	/**
	 * Convert filters to Record<prefix, title> object
	 */
	function getFilterTitles(block: FiltersBlock): Record<string, string> {
		const result = Object.create(null);
		Object.keys(block.filters).forEach(filter => {
			result[filter] = block.filters[filter].title;
		});
		return result;
	}

	/**
	 * Do tests
	 */
	it('Creating view', done => {
		const registry = setupRegistry('home');

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as SearchView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new SearchView(
			registry.id,
			objectToRoute({
				type: 'search',
				params: {
					search: 'home',
				},
			} as PartialRoute) as SearchRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'search',
			params: {
				search: 'home',
				short: true,
				page: 0,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', done => {
		const view = setupView(data => {
			expect(data).to.be.equal(view);
			done();
		}, 'home');
	});

	it('Not found', done => {
		const keyword = 'home';
		const registry = new Registry(namespace + nsCounter++);

		// Change pagination limit for tests to 32
		const config = registry.config;
		config.data.display.itemsPerPage = 32;

		// Change API to fake API and load fixture
		const api = new FakeAPI(registry);
		registry.api = api;
		api.setFakeData(
			'/search',
			{
				query: keyword,
				limit: 64,
			},
			null
		);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
			const view = data as SearchView;
			expect(view.error).to.be.equal('not_found');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new SearchView(
			registry.id,
			objectToRoute({
				type: 'search',
				params: {
					search: keyword,
				},
			} as PartialRoute) as SearchRoute
		);
		view.startLoading();
	});

	it('Test "home" search"', done => {
		const view = setupView(data => {
			expect(data).to.be.equal(view);

			// Check view
			expect(view.keyword).to.be.equal('home');
			expect(view.itemsLimit).to.be.equal(64);

			const blocks = view.render() as NonNullable<SearchViewBlocks>;
			expect(blocks).to.not.be.equal(null);

			// Test collections
			expect(blocks.collections).to.not.be.equal(null);
			expect(isFiltersBlockEmpty(blocks.collections)).to.be.equal(false);

			const filterTitles = getFilterTitles(
				blocks.collections as FiltersBlock
			);
			expect(filterTitles).to.be.eql({
				'ant-design': 'Ant Design Icons',
				'bytesize': 'Bytesize Icons',
				'dashicons': 'Dashicons',
				'el': 'Elusive Icons',
				'entypo': 'Entypo+',
				'fa-solid': 'Font Awesome 5 Solid',
				'fe': 'Feather Icon',
				'feather': 'Feather Icons',
				'flat-color-icons': 'Flat Color Icons',
				'foundation': 'Foundation',
				'ic': 'Google Material Icons',
				'icomoon-free': 'IcoMoon Free',
				'icons8': 'Icons8 Windows 10 Icons',
				'ion': 'IonIcons',
				'jam': 'Jam Icons',
				'maki': 'Maki',
				'map': 'Map Icons',
				'mdi': 'Material Design Icons',
				'mdi-light': 'Material Design Light',
				'octicon': 'Octicons',
				'oi': 'Open Iconic',
				'raphael': 'Raphael',
				'si-glyph': 'SmartIcons Glyph',
				'subway': 'Subway Icon Set',
			});

			// Test icons list
			expect(blocks.icons).to.not.be.equal(null);
			expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(false);
			expect(blocks.icons.icons.length).to.be.equal(32);
			expect(blocks.icons.icons[0]).to.be.eql({
				prefix: 'ant-design',
				name: 'home-fill',
			});

			// Test pagination
			expect(blocks.pagination).to.not.be.equal(null);
			expect(isPaginationEmpty(blocks.pagination)).to.be.equal(false);
			const expectedPagination: PaginationBlock = {
				type: 'pagination',
				length: 64,
				fullLength: 64,
				more: true,
				page: 0,
				perPage: 32,
			};
			expect(blocks.pagination).to.be.eql(expectedPagination);

			done();
		}, 'home');
	});

	it('Test "home" search", full results', done => {
		const view = setupView(
			data => {
				let expectedPagination: PaginationBlock;

				expect(data).to.be.equal(view);

				// Check view
				expect(view.keyword).to.be.equal('home');
				expect(view.itemsLimit).to.be.equal(999);

				let blocks = view.render() as NonNullable<SearchViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test collections
				expect(blocks.collections).to.not.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.collections)).to.be.equal(
					false
				);

				const filterTitles = getFilterTitles(
					blocks.collections as FiltersBlock
				);
				expect(filterTitles).to.be.eql({
					'ant-design': 'Ant Design Icons',
					'bytesize': 'Bytesize Icons',
					'dashicons': 'Dashicons',
					'el': 'Elusive Icons',
					'entypo': 'Entypo+',
					'fa-solid': 'Font Awesome 5 Solid',
					'fe': 'Feather Icon',
					'feather': 'Feather Icons',
					'flat-color-icons': 'Flat Color Icons',
					'foundation': 'Foundation',
					'ic': 'Google Material Icons',
					'icomoon-free': 'IcoMoon Free',
					'icons8': 'Icons8 Windows 10 Icons',
					'ion': 'IonIcons',
					'jam': 'Jam Icons',
					'maki': 'Maki',
					'map': 'Map Icons',
					'mdi': 'Material Design Icons',
					'mdi-light': 'Material Design Light',
					'octicon': 'Octicons',
					'oi': 'Open Iconic',
					'raphael': 'Raphael',
					'si-glyph': 'SmartIcons Glyph',
					'subway': 'Subway Icon Set',
					'topcoat': 'TopCoat Icons',
					'typcn': 'Typicons',
					'uil': 'Unicons',
					'vaadin': 'Vaadin Icons',
					'fa': 'Font Awesome 4',
					'ls': 'Ligature Symbols',
					'ps': 'PrestaShop Icons',
					'simple-line-icons': 'Simple line icons',
					'whh': 'WebHostingHub Glyphs',
					'zmdi': 'Material Design Iconic Font',
				});

				// Test icons list
				expect(blocks.icons).to.not.be.equal(null);
				expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(false);
				expect(blocks.icons.icons.length).to.be.equal(32);
				expect(blocks.icons.icons[0]).to.be.eql({
					prefix: 'ant-design',
					name: 'home-fill',
				});

				// Test pagination
				expect(blocks.pagination).to.not.be.equal(null);
				expect(isPaginationEmpty(blocks.pagination)).to.be.equal(false);
				expectedPagination = {
					type: 'pagination',
					length: 86,
					fullLength: 86,
					more: false,
					page: 0,
					perPage: 32,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				/**
				 * Change pagination to third page
				 */
				view.route.params.page = 2;
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<SearchViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test icons list
				expect(isIconsListBlockEmpty(blocks.icons)).to.be.equal(false);
				expect(blocks.icons.icons.length).to.be.equal(22);
				expect(blocks.icons.icons[0]).to.be.eql({
					prefix: 'subway',
					name: 'home',
				});
				expect(
					blocks.icons.icons[blocks.icons.icons.length - 1]
				).to.be.eql({
					prefix: 'uil',
					name: 'tachometer-fast',
				});

				// Test pagination
				expectedPagination = {
					type: 'pagination',
					length: 86,
					fullLength: 86,
					more: false,
					page: 2,
					perPage: 32,
				};
				expect(blocks.pagination).to.be.eql(expectedPagination);

				done();
			},
			'home',
			false
		);
	});
});
