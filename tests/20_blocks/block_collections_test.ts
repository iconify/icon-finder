/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import type { CollectionsListBlock } from '../../lib/blocks/collections-list';
import {
	defaultCollectionsListBlock,
	isCollectionsBlockEmpty,
	getCollectionsBlockCategories,
	getCollectionsBlockPrefixes,
	filterCollectionsBlock,
} from '../../lib/blocks/collections-list';
import { autoIndexCollections } from '../../lib/converters/collections';
import type { CollectionInfo } from '../../lib/converters/info';
import { defaultCollectionInfo } from '../collection_info';

describe('Testing collections list block', () => {
	it('Block tests', () => {
		const block: CollectionsListBlock = defaultCollectionsListBlock();
		let filteredBlock: CollectionsListBlock;

		// Empty
		expect(isCollectionsBlockEmpty(block)).to.be.eql(true);
		expect(getCollectionsBlockCategories(block)).to.be.eql([]);
		expect(getCollectionsBlockPrefixes(block)).to.be.eql([]);

		// Add empty category
		block.collections = {
			visible: {
				General: {},
			},
			hidden: {},
		};
		expect(isCollectionsBlockEmpty(block)).to.be.eql(true);
		expect(getCollectionsBlockCategories(block)).to.be.eql(['General']);
		expect(getCollectionsBlockCategories(block, true)).to.be.eql([]);
		expect(getCollectionsBlockPrefixes(block)).to.be.eql([]);

		// Add one collection
		block.collections = {
			visible: {
				General: {
					foo: Object.assign(defaultCollectionInfo(), {
						prefix: 'foo',
						title: 'Foo',
					}),
				},
			},
			hidden: {},
		};
		expect(isCollectionsBlockEmpty(block)).to.be.eql(false);
		expect(getCollectionsBlockCategories(block)).to.be.eql(['General']);
		expect(getCollectionsBlockCategories(block, true)).to.be.eql([
			'General',
		]);
		expect(getCollectionsBlockPrefixes(block)).to.be.eql(['foo']);

		// Add more collections
		block.collections = {
			visible: {
				General: {
					foo: Object.assign(defaultCollectionInfo(), {
						prefix: 'foo',
						title: 'Foo',
					}),
					bar: Object.assign(defaultCollectionInfo(), {
						prefix: 'bar',
						title: 'Bar',
					}),
				},
				Emoji: {
					baz: Object.assign(defaultCollectionInfo(), {
						prefix: 'baz',
						title: 'Baz',
					}),
				},
			},
			hidden: {},
		};
		expect(isCollectionsBlockEmpty(block)).to.be.eql(false);
		expect(getCollectionsBlockCategories(block)).to.be.eql([
			'General',
			'Emoji',
		]);
		expect(getCollectionsBlockCategories(block, true)).to.be.eql([
			'General',
			'Emoji',
		]);
		expect(getCollectionsBlockPrefixes(block)).to.be.eql([
			'foo',
			'bar',
			'baz',
		]);

		// Test filter
		filteredBlock = filterCollectionsBlock(
			block,
			(item: CollectionInfo, category: string, prefix: string) =>
				category === 'General',
			true
		);

		// Test new block
		expect(getCollectionsBlockCategories(filteredBlock)).to.be.eql([
			'General',
			'Emoji',
		]);
		expect(getCollectionsBlockCategories(filteredBlock, true)).to.be.eql([
			'General',
		]);
		expect(getCollectionsBlockPrefixes(filteredBlock)).to.be.eql([
			'foo',
			'bar',
		]);

		// Make sure original block was not changed
		expect(filteredBlock).to.not.be.equal(block);
		expect(getCollectionsBlockCategories(block)).to.be.eql([
			'General',
			'Emoji',
		]);
		expect(getCollectionsBlockCategories(block, true)).to.be.eql([
			'General',
			'Emoji',
		]);
		expect(getCollectionsBlockPrefixes(block)).to.be.eql([
			'foo',
			'bar',
			'baz',
		]);

		// Test filter without third parameter
		filteredBlock = filterCollectionsBlock(
			block,
			(item: CollectionInfo, category: string, prefix: string) =>
				prefix === 'baz'
		);

		expect(filteredBlock).to.not.be.equal(block);
		expect(getCollectionsBlockCategories(filteredBlock)).to.be.eql([
			'Emoji',
		]);
		expect(getCollectionsBlockCategories(filteredBlock, true)).to.be.eql([
			'Emoji',
		]);
		expect(getCollectionsBlockPrefixes(filteredBlock)).to.be.eql(['baz']);

		// Test autoIndexCollections
		autoIndexCollections(block.collections);

		const visibleItems = block.collections.visible;
		expect(visibleItems.General.foo.index).to.be.equal(0);
		expect(visibleItems.General.bar.index).to.be.equal(1);
		expect(visibleItems.Emoji.baz.index).to.be.equal(2);
	});
});
