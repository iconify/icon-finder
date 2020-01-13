/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import 'mocha';
import { expect } from 'chai';
import {
	FiltersBlock,
	defaultFiltersBlock,
	isFiltersBlockEmpty,
	enableFilters,
	autoIndexFilters,
} from '../../lib/blocks/filters';

describe('Testing filters block', () => {
	it('Block tests', () => {
		const block: FiltersBlock = defaultFiltersBlock();
		const expected: FiltersBlock = defaultFiltersBlock();

		// Empty
		expect(isFiltersBlockEmpty(block)).to.be.eql(true);

		// Add one filter
		block.filters.Foo = {
			title: 'Foo',
		};
		expected.filters.Foo = {
			title: 'Foo',
		};
		expect(isFiltersBlockEmpty(block)).to.be.eql(true);

		// Add another filter
		block.filters.Bar = {
			title: 'Bar',
		};
		expected.filters.Bar = {
			title: 'Bar',
		};
		expect(isFiltersBlockEmpty(block)).to.be.eql(false);

		// Test enableFilters()
		enableFilters(block);
		expected.filters.Foo.disabled = false;
		expected.filters.Bar.disabled = false;
		expect(block).to.be.eql(expected);

		enableFilters(block, false);
		expected.filters.Foo.disabled = true;
		expected.filters.Bar.disabled = true;
		expect(block).to.be.eql(expected);

		// Test autoIndexFilters()
		autoIndexFilters(block);
		expected.filters.Foo.index = 0;
		expected.filters.Bar.index = 1;
		expect(block).to.be.eql(expected);
	});
});
