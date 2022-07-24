import { getPaginationResult } from '../../lib/data/pagination/calc';

describe('Testing pagination', () => {
	it('Calculating number of pages', () => {
		const perPage = 20;
		let total: number;

		// Simple result
		total = 1;
		expect(
			getPaginationResult(
				{
					perPage,
				},
				total
			)
		).toEqual({
			perPage,
			total,
			page: 0,
			maxPage: 0,
			totalPages: 1,
		});

		// Empty
		total = 0;
		expect(
			getPaginationResult(
				{
					perPage,
				},
				total,
				1000
			)
		).toEqual({
			perPage,
			total,
			page: 0,
			maxPage: 0,
			totalPages: 0,
		});

		// Full page
		total = perPage;
		expect(
			getPaginationResult(
				{
					perPage,
				},
				total,
				1
			)
		).toEqual({
			perPage,
			total,
			page: 0,
			maxPage: 0,
			totalPages: 1,
		});

		// Full page + 1
		total = perPage + 1;
		expect(
			getPaginationResult(
				{
					perPage,
				},
				total,
				1
			)
		).toEqual({
			perPage,
			total,
			page: 1,
			maxPage: 1,
			totalPages: 2,
		});

		// 5 pages
		total = perPage * 5;
		expect(
			getPaginationResult(
				{
					perPage,
				},
				total,
				3
			)
		).toEqual({
			perPage,
			total,
			page: 3,
			maxPage: 4,
			totalPages: 5,
		});
	});
});
