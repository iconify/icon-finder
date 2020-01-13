/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import {
	CollectionsFilterBlock,
	defaultCollectionsFilterBlock,
	isCollectionsFilterBlockEmpty,
} from '../../lib/blocks/collections-filter';
import {
	FiltersBlock,
	defaultFiltersBlock,
	defaultFilter,
} from '../../lib/blocks/filters';
import {
	CollectionsListBlock,
	defaultCollectionsListBlock,
	getCollectionsBlockCategories,
	getCollectionsBlockPrefixes,
	applyCollectionsFilter,
} from '../../lib/blocks/collections-list';
import { dataToCollections } from '../../lib/converters/collections';
import { getFixture } from '../get_fixture';

describe('Testing collections filters block', () => {
	it('isCollectionsFilterBlockEmpty', () => {
		const block: CollectionsFilterBlock = defaultCollectionsFilterBlock();

		// Empty
		expect(isCollectionsFilterBlockEmpty(block)).to.be.eql(true);

		// Add keyword
		block.keyword = 'foo';
		expect(isCollectionsFilterBlockEmpty(block)).to.be.eql(false);
	});

	it('applyCollectionsFilter', () => {
		// Create empty collections filter block
		const collectionsFilter: CollectionsFilterBlock = defaultCollectionsFilterBlock();

		// Create empty collections list block and empty value for comparison
		const collections: CollectionsListBlock = defaultCollectionsListBlock();
		let filteredCollections: CollectionsListBlock;

		// Create empty categories filter block and another one for comparison
		const categoriesFilter: FiltersBlock = Object.assign(
			defaultFiltersBlock(),
			{
				type: 'categories',
			}
		);
		const expectedCategoriesFilter: FiltersBlock = Object.assign(
			defaultFiltersBlock(),
			{
				type: 'categories',
			}
		);

		// Load collections from fixture
		const raw = JSON.parse(getFixture('collections.json'));
		collections.collections = dataToCollections(raw);

		// Make clone for comparison to make sure function does not modify collections list
		const collectionsClone = JSON.parse(JSON.stringify(collections));
		expect(collectionsClone).to.be.eql(collections);

		// Get categories
		const categories = getCollectionsBlockCategories(collections);
		expect(categories).to.be.eql(['General', 'Emoji', 'Thematic']);

		// Set categories as filters
		categories.forEach(category => {
			categoriesFilter.filters[category] = defaultFilter(category);
			expectedCategoriesFilter.filters[category] = defaultFilter(
				category
			);
		});

		// Make sure filters are not identical, but blocks are similar
		expect(categoriesFilter.filters).to.not.be.equal(
			expectedCategoriesFilter.filters
		);
		expect(categoriesFilter).to.be.eql(expectedCategoriesFilter);

		// Disable "Emoji" for test
		categoriesFilter.filters.Emoji.disabled = true;
		expect(categoriesFilter).to.not.be.eql(expectedCategoriesFilter);

		// Apply empty filter
		filteredCollections = applyCollectionsFilter(
			collections,
			collectionsFilter,
			categoriesFilter
		);

		// Result should be same as source
		expect(filteredCollections).to.be.equal(collections);

		// Attribute 'disabled' should have been set to false for all filters, resetting filters to original state
		expect(categoriesFilter).to.be.eql(expectedCategoriesFilter);

		/**
		 * Test "awesome" filter
		 *
		 * Results should include only fa-solid, fa-regular, fa and fa-brands
		 */
		// Set filter to "awesome"
		collectionsFilter.keyword = 'awesome';

		// Apply filter
		filteredCollections = applyCollectionsFilter(
			collections,
			collectionsFilter,
			categoriesFilter
		);

		// Result should not be same as source and should not have same content
		expect(filteredCollections).to.not.be.equal(collections);
		expect(filteredCollections).to.not.be.eql(collections);

		// Categories should include "Emoji", but it should be empty
		expect(getCollectionsBlockCategories(filteredCollections)).to.be.eql([
			'General',
			'Emoji',
			'Thematic',
		]);
		expect(getCollectionsBlockPrefixes(filteredCollections)).to.be.eql([
			'fa-solid',
			'fa-regular',
			'fa',
			'fa-brands',
		]);
		expect(filteredCollections.collections.Emoji).to.be.eql({});

		// Test categories filter. "Emoji" should be disabled
		expect(categoriesFilter).to.not.be.eql(expectedCategoriesFilter);
		expect(categoriesFilter.filters.General.disabled).to.be.equal(false);
		expect(categoriesFilter.filters.Emoji.disabled).to.be.equal(true);
		expect(categoriesFilter.filters.Thematic.disabled).to.be.equal(false);
	});
});
