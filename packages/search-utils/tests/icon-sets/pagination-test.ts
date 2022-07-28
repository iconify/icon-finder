/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { loadFixture } from '../../lib/tests/helpers';
import { filterIconSet } from '../../lib/data/icon-set/filter/filters';
import { convertAPIv2IconSet } from '../../lib/data/icon-set/convert/api-v2';
import { utilsConfig } from '../../lib/config/ui';
import { applyPagination } from '../../lib/data/pagination/apply';
import type { APIv2CollectionResponse } from '../../lib/data/api-types/v2';
import type { IconFinderFilter } from '../../lib/data/filters/types/filter';

describe('Pagination in icon set', () => {
	// Reset pagination config
	beforeEach(() => {
		utilsConfig.iconsPerPage = 64;
	});

	// Find filter
	function findFilter(
		filters: IconFinderFilter[],
		title: string
	): IconFinderFilter | undefined {
		return filters.find((item) => item.title === title);
	}

	it('Pagination for icon set', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('api-v2/mdi.json')
		) as APIv2CollectionResponse;
		const iconSet = convertAPIv2IconSet('', rawData)!;

		// Config should be empty
		expect(iconSet.pagination).toEqual({});

		// Get icons
		const icons = filterIconSet(iconSet, '');

		// Apply pagination
		let result = applyPagination(icons);

		// Make sure result includes all data
		expect(result.icons).toBe(icons.icons);
		expect(result.icons.length).toBe(7096);

		// Only first page
		expect(result.visible.length).toBe(64);
		expect(result.visible[0]).toBe(result.icons[0]);
		expect(result.visible[63]).toBe(result.icons[63]);

		// Check generated pagination
		expect(result.pages).toEqual({
			perPage: 64,
			page: 0,
			total: 7096,
			maxPage: 110,
			totalPages: 111,
		});

		//
		// 100th page
		//
		icons.pagination.page = 100;
		result = applyPagination(icons);

		// 100th page
		expect(result.visible.length).toBe(64);
		expect(result.visible[0]).toBe(result.icons[6400]);
		expect(result.visible[63]).toBe(result.icons[6463]);

		// Check generated pagination
		expect(result.pages).toEqual({
			perPage: 64,
			page: 100,
			total: 7096,
			maxPage: 110,
			totalPages: 111,
		});

		//
		// Last page
		//
		iconSet.pagination.page = 110;
		result = applyPagination(icons);

		// Check icons
		expect(result.visible.length).toBe(56);
		expect(result.visible[0]).toBe(result.icons[7040]);
		expect(result.visible[55]).toBe(result.icons[7095]);

		// Check generated pagination
		expect(result.pages).toEqual({
			perPage: 64,
			page: 110,
			total: 7096,
			maxPage: 110,
			totalPages: 111,
		});

		//
		// Second page, custom config
		//
		iconSet.pagination.page = 1;
		iconSet.pagination.perPage = 100;
		result = applyPagination(icons);

		// Check icons
		expect(result.visible.length).toBe(100);
		expect(result.visible[0]).toBe(result.icons[100]);
		expect(result.visible[99]).toBe(result.icons[199]);

		// Check generated pagination
		expect(result.pages).toEqual({
			perPage: 100,
			page: 1,
			total: 7096,
			maxPage: 70,
			totalPages: 71,
		});
	});

	it('Filter by tag', async () => {
		// Load icon set
		const rawData = JSON.parse(
			await loadFixture('api-v2/mdi.json')
		) as APIv2CollectionResponse;
		const iconSet = convertAPIv2IconSet('', rawData)!;

		const filters = iconSet.filters;
		const tags = filters.tags!;

		// Custom icons per page and third page
		iconSet.pagination.perPage = 100;
		iconSet.pagination.page = 2;

		//
		// Filter by 'Nature' tag
		//
		const natureTagFilter = findFilter(tags.filters, 'Nature');
		expect(natureTagFilter).toBeDefined();
		tags.selected = natureTagFilter;
		const icons = filterIconSet(iconSet, '');

		// Apply pagination
		const result = applyPagination(icons);

		// Make sure result includes all data
		expect(result.icons).toBe(icons.icons);
		expect(result.icons.length).toBe(78);

		// Only first page
		expect(result.visible.length).toBe(78);
		expect(result.visible[0]).toBe(result.icons[0]);
		expect(result.visible[77]).toBe(result.icons[77]);

		// Check generated pagination
		expect(result.pages).toEqual({
			perPage: 100,
			page: 0,
			total: 78,
			maxPage: 0,
			totalPages: 1,
		});

		// Check config
		expect(result.pagination).toEqual({
			page: 2, // Ignored, even if it is invalid, until page is clicked
			perPage: 100,
		});
	});
});
