import 'mocha';
import { expect } from 'chai';
import type { PaginationBlock } from '../../lib/blocks/pagination';
import {
	defaultPaginationBlock,
	isPaginationEmpty,
	showPagination,
	maxPage,
	getPageForIndex,
} from '../../lib/blocks/pagination';

interface TestRange {
	min: number; // minimum number, inclusive
	max: number; // maximum numner, not inclusive
}

function makeRange(ranges: TestRange[]): number[] {
	const result: number[] = [];
	ranges.forEach((range) => {
		for (let i = range.min; i < range.max; i++) {
			result.push(i);
		}
	});
	return result;
}

describe('Testing pagination block', () => {
	it('Block tests', () => {
		const block: PaginationBlock = defaultPaginationBlock();

		let expected: number[];

		// Empty
		expect(isPaginationEmpty(block)).to.be.eql(true);
		expect(showPagination(block)).to.be.eql([]);
		expect(maxPage(block)).to.be.equal(0);

		// Add few items, but still 1 page
		block.length = 10;
		expect(isPaginationEmpty(block)).to.be.eql(true);
		expect(showPagination(block)).to.be.eql([]);
		expect(maxPage(block)).to.be.equal(0);

		// 1 full page
		block.length = block.perPage;
		expect(isPaginationEmpty(block)).to.be.eql(true);
		expect(showPagination(block)).to.be.eql([]);
		expect(maxPage(block)).to.be.equal(0);

		// 2 pages
		block.length = block.perPage + 1;
		expect(isPaginationEmpty(block)).to.be.eql(false);
		expect(showPagination(block)).to.be.eql([0, 1]);
		expect(maxPage(block)).to.be.equal(1);

		// Negative length
		block.length = -100;
		expect(isPaginationEmpty(block)).to.be.eql(true);
		expect(showPagination(block)).to.be.eql([]);
		expect(maxPage(block)).to.be.equal(0);

		// First 3 - 12 pages
		for (let i = 3; i <= 12; i++) {
			block.length = block.perPage * i;
			expected = makeRange([
				{
					min: 0,
					max: i,
				},
			]);

			expect(showPagination(block)).to.be.eql(expected);
		}

		// First 3 and last 3
		block.length = block.perPage * 14;
		block.page = 0;
		expected = makeRange([
			{
				min: 0,
				max: 3,
			},
			{
				min: 11,
				max: 14,
			},
		]);
		expect(showPagination(block)).to.be.eql(expected);

		// Add pages at start - should include all pages (first 3 + 1 in middle + 2 before current)
		for (let i = 1; i < 7; i++) {
			block.page = i;
			expected = makeRange([
				{
					min: 0,
					max: i + 3,
				},
				{
					min: 11,
					max: 14,
				},
			]);
			expect(showPagination(block)).to.be.eql(expected);
		}

		// Space between 2 and page - 2, all pages at the end
		for (let i = 7; i < 14; i++) {
			block.page = i;
			expected = makeRange([
				{
					min: 0,
					max: 3,
				},
				{
					min: i - 2,
					max: 14,
				},
			]);
			expect(showPagination(block)).to.be.eql(expected);
		}

		// Gaps on both sides of current page
		block.page = 7;
		block.length = 15 * block.perPage;
		expected = makeRange([
			{
				min: 0,
				max: 3,
			},
			{
				min: block.page - 2,
				max: block.page + 3,
			},
			{
				min: 12,
				max: 15,
			},
		]);
		expect(showPagination(block)).to.be.eql(expected);
	});

	it('getPageForIndex', () => {
		const perPage = 24;

		expect(getPageForIndex(perPage, 0)).to.be.equal(0);
		expect(getPageForIndex(perPage, perPage - 1)).to.be.equal(0);
		expect(getPageForIndex(perPage, perPage)).to.be.equal(1);
		expect(getPageForIndex(perPage, perPage * 2 - 1)).to.be.equal(1);
		expect(getPageForIndex(perPage, perPage * 2)).to.be.equal(2);

		// Negative number
		expect(getPageForIndex(perPage, -100)).to.be.equal(0);
	});
});
