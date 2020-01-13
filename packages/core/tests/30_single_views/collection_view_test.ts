/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import {
	CollectionView,
	CollectionViewBlocks,
} from '../../lib/views/collection';
import { createRegistry, Registry } from '../../lib/registry';
import {
	objectToRoute,
	CollectionRoute,
	PartialRoute,
} from '../../lib/route/types';
import {
	CollectionRouteParams,
	objectToRouteParams,
} from '../../lib/route/params';
import { API as FakeAPI } from '../fake_api';
import { EventCallback } from '../../lib/events';
import { FiltersBlock, isFiltersBlockEmpty } from '../../lib/blocks/filters';
import { ExtendedIcon } from '../../lib/icon';
import { IconsListBlock } from '../../lib/blocks/icons-list';
import { isSearchBlockEmpty } from '../../lib/blocks/search';

describe('Testing collection view', () => {
	const namespace = __filename;
	let nsCounter = 0;

	/**
	 * Setup registry for test
	 */
	function setupRegistry(
		prefix: string,
		routeParams: Partial<CollectionRouteParams> | null = null
	): Registry {
		const registry = createRegistry(namespace + nsCounter++);

		// Change pagination limit for tests to 48
		const config = registry.config;
		config.data.display.itemsPerPage = 48;

		// Change API to fake API and load fixture
		const api = new FakeAPI(registry);
		registry.api = api;
		api.loadFixture(
			'/collection',
			{
				info: 'true',
				prefix: prefix,
			},
			prefix
		);
		return registry;
	}

	/**
	 * Setup event and callback
	 */
	function setupView(
		callback: EventCallback,
		prefix: string,
		routeParams: Partial<CollectionRouteParams> | null = null
	): CollectionView {
		const registry = setupRegistry(prefix, routeParams);

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', callback);

		// Merge params
		const params = objectToRouteParams(
			'collection',
			Object.assign({}, routeParams === null ? {} : routeParams, {
				prefix: prefix,
			})
		) as CollectionRouteParams;

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: params,
			}) as CollectionRoute
		);
		view.startLoading();

		return view;
	}

	/**
	 * Get icon names from block
	 */
	function getIconNames(block: IconsListBlock): string[] {
		return (block.icons as ExtendedIcon[]).map(icon => {
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
	 * Do tests
	 */
	it('Creating view', done => {
		const registry = setupRegistry('fa-regular');

		// Set variables
		let loaded = false;

		// Sign up for event
		const events = registry.events;
		events.subscribe('view-loaded', data => {
			expect(loaded).to.be.equal(false);
			loaded = true;

			const view = data as CollectionView;
			expect(view.error).to.be.equal('');
			expect(view.loading).to.be.equal(false);

			done();
		});

		// Create view
		const view = new CollectionView(
			registry.id,
			objectToRoute({
				type: 'collection',
				params: {
					prefix: 'fa-regular',
				},
			} as PartialRoute) as CollectionRoute
		);
		view.startLoading();

		// Make sure view is loaded asynchronously, even though data is available instantly
		expect(view.loading).to.be.equal(true);
		expect(view.error).to.be.equal('');
		expect(loaded).to.be.equal(false);

		// Make sure all route params have been setup
		expect(view.route).to.be.eql({
			type: 'collection',
			params: {
				prefix: 'fa-regular',
				filter: '',
				page: 0,
				tag: null,
				themePrefix: null,
				themeSuffix: null,
			},
			parent: null,
		});
	});

	// Same as previous test, but combined to one function for simpler tests
	it('Test using setupView code', done => {
		const view = setupView(data => {
			expect(data).to.be.equal(view);
			done();
		}, 'fa-regular');
	});

	it('Test fa-regular ()', done => {
		const view = setupView(
			data => {
				let iconNames: string[];
				let tags: FiltersBlock;
				let tagsList: string[];

				// Check view
				expect(view.prefix).to.be.equal('fa-regular');
				expect(view.error).to.be.equal('');

				let blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');
				expect(isSearchBlockEmpty(blocks.filter)).to.be.equal(true);

				// Themes should not be set
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.themePrefixes)).to.be.equal(
					true
				);
				expect(blocks.themeSuffixes).to.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.themeSuffixes)).to.be.equal(
					true
				);

				// Tags
				expect(blocks.tags).to.not.be.equal(null);
				expect(isFiltersBlockEmpty(blocks.tags)).to.be.equal(false);

				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal(null);
				expect(tags.type).to.be.equal('tags');
				expect(Object.keys(tags.filters)).to.be.eql([
					'Accessibility',
					'Alert',
					'Arrows',
					'Audio & Video',
					'Buildings',
					'Business',
					'Camping',
					'Charity',
					'Chat',
					'Code',
					'Communication',
					'Computers',
					'Currency',
					'Date & Time',
					'Design',
					'Editors',
					'Education',
					'Emoji',
					'Energy',
					'Files',
					'Finance',
					'Fitness',
					'Food',
					'Fruits & Vegetables',
					'Games',
					'Hands',
					'Health',
					'Hotel',
					'Images',
					'Interfaces',
					'Maps',
					'Maritime',
					'Marketing',
					'Medical',
					'Music',
					'Objects',
					'Payments & Shopping',
					'Political',
					'Science Fiction',
					'Security',
					'Shapes',
					'Social',
					'Spinners',
					'Sports',
					'Status',
					'Summer',
					'Toggle',
					'Travel',
					'Users & People',
					'Vehicles',
					'Weather',
					'Writing',
				]);

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Pagination
				expect(blocks.pagination).to.be.eql({
					length: 151,
					more: false,
					page: 3,
					perPage: 48,
				});

				// Icons
				expect(blocks.icons.icons.length).to.be.equal(7); // 151 - 48 * 3

				// Check for window-minimize
				expect(
					blocks.icons.icons.filter(
						icon => icon.name === 'window-minimize'
					).length
				).to.be.equal(1);

				/**
				 * Apply category filter
				 */
				view.route.params.tag = 'Weather';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Check tags filter
				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal('Weather');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Check pagination
				expect(view.route.params.page).to.be.equal(0);
				expect(blocks.pagination).to.be.eql({
					length: 3,
					more: false,
					page: 0,
					perPage: 48,
				});

				// Check icons
				expect(blocks.icons.icons.length).to.be.equal(3);
				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql(['moon', 'snowflake', 'sun']);

				/**
				 * Reset tag filter, apply keyword filter
				 */
				view.route.params.tag = null;
				view.route.params.filter = 'cal';
				view.blocksRequireUpdate = true;

				blocks = view.render() as NonNullable<CollectionViewBlocks>;
				expect(blocks).to.not.be.equal(null);

				// Check pagination
				expect(blocks.pagination).to.be.eql({
					length: 6,
					more: false,
					page: 0,
					perPage: 48,
				});

				// Check icons
				iconNames = getIconNames(blocks.icons);
				expect(iconNames).to.be.eql([
					'calendar',
					'calendar-alt',
					'calendar-check',
					'calendar-minus',
					'calendar-plus',
					'calendar-times',
				]);

				// Check tags
				tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal(null);
				expect(tags.type).to.be.equal('tags');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.not.be.eql([]);

				// Check for enabled tags
				tagsList = filterTags(tags, false);
				expect(tagsList).to.be.eql([
					'Business',
					'Date & Time',
					'Interfaces',
					'Objects',
					'Shapes',
					'Status',
				]);

				done();
			},
			'fa-regular',
			{
				page: 3,
			}
		);
	});

	it('Test mdi (uncategorised)', done => {
		const view = setupView(
			data => {
				let tagsList: string[];

				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');

				// Themes should not be set
				expect(blocks.themePrefixes).to.be.equal(null);
				expect(blocks.themeSuffixes).to.be.equal(null);

				// Tags
				expect(blocks.tags).to.not.be.equal(null);

				const tags = blocks.tags as FiltersBlock;
				expect(tags.active).to.be.equal('');
				expect(tags.type).to.be.equal('tags');
				tagsList = Object.keys(tags.filters);
				expect(tagsList.length).to.be.equal(60);

				// Last tag should be '' = uncategorised
				expect(tagsList.pop()).to.be.equal('');

				// Check for disabled tags
				tagsList = filterTags(tags, true);
				expect(tagsList).to.be.eql([]);

				// Pagination
				expect(blocks.pagination).to.be.eql({
					length: 1497,
					more: false,
					page: 0,
					perPage: 48,
				});

				done();
			},
			'mdi',
			{
				tag: '',
			}
		);
	});

	it('Test ant-design (filter by suffix)', done => {
		const view = setupView(
			data => {
				let suffixesList: string[];

				const blocks = view.render() as NonNullable<
					CollectionViewBlocks
				>;
				expect(blocks).to.not.be.equal(null);

				// Test search block
				expect(blocks.filter.keyword).to.be.equal('');

				// Tags and prefixes should not be set
				expect(blocks.tags).to.be.equal(null);
				expect(blocks.themePrefixes).to.be.equal(null);

				// Suffixes
				expect(blocks.themeSuffixes).to.not.be.equal(null);

				const suffixes = blocks.themeSuffixes as FiltersBlock;
				expect(suffixes.active).to.be.equal('Outline');
				expect(suffixes.type).to.be.equal('themeSuffixes');
				suffixesList = Object.keys(suffixes.filters);
				expect(suffixesList).to.be.eql(['Fill', 'Outline', 'TwoTone']);

				// Check for disabled suffixes
				suffixesList = filterTags(suffixes, true);
				expect(suffixesList).to.be.eql([]);

				// Pagination
				expect(blocks.pagination).to.be.eql({
					length: 366,
					more: false,
					page: 3,
					perPage: 48,
				});

				// Check icons block for "git*" icons
				const iconNames = getIconNames(blocks.icons).filter(
					name => name.slice(0, 3) === 'git'
				);
				expect(iconNames).to.be.eql([
					'github-outline',
					'gitlab-outline',
				]);

				done();
			},
			'ant-design',
			{
				themeSuffix: 'Outline',
				page: 3,
			}
		);
	});
});
