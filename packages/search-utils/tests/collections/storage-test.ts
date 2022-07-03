/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyInfo } from '@iconify/types';
import { promises as fs } from 'fs';
import { nextProvider } from '../../lib/tests/helpers';
import { convertCollectionsList } from '../../lib/collections/convert/list';
import { applyCollectionsListFilter } from '../../lib/collections/filter/apply';
import {
	storeCollectionsList,
	getCollectionsList,
	awaitCollectionsList,
} from '../../lib/collections/storage';
import type { IconFinderCollectionsList } from '../../lib/collections/types/collections';

describe('Testing collections storage', () => {
	// Storage for data, loaded from fixtures
	let data: Record<string, IconifyInfo>;
	beforeAll(async () => {
		data = JSON.parse(
			await fs.readFile('tests/fixtures/collections/all.json', 'utf8')
		) as Record<string, IconifyInfo>;
	});

	// Get collections by prefixes
	function getCollections(prefixes: string[]): IconFinderCollectionsList {
		const source = Object.create(null) as Record<string, IconifyInfo>;
		prefixes.forEach((prefix) => {
			if (!data[prefix]) {
				throw new Error(`Cannot find data for "${prefix}"`);
			}
			source[prefix] = data[prefix];
		});

		return convertCollectionsList(source);
	}

	test('Get collections synchronously', () => {
		const provider = nextProvider();
		const collections = getCollections([
			'mdi',
			'mdi-light',
			'ic',
			'line-md',
		]);

		// Check that storage is empty
		expect(getCollectionsList(provider)).toBeUndefined();

		// Store
		storeCollectionsList(provider, collections);

		// Get collections list
		const result = getCollectionsList(provider);
		expect(result).toBeDefined();
		expect(Object.keys(result!)).toEqual([
			'mdi',
			'mdi-light',
			'ic',
			'line-md',
		]);
	});

	test('Filters should not affect it', () => {
		const provider = nextProvider();
		const collections = getCollections([
			'mdi',
			'mdi-light',
			'ic',
			'line-md',
		]);
		collections.search = 'line';
		applyCollectionsListFilter(collections);

		// Check that storage is empty
		expect(getCollectionsList(provider)).toBeUndefined();

		// Store
		storeCollectionsList(provider, collections);

		// Get collections list
		const result = getCollectionsList(provider);
		expect(result).toBeDefined();
		expect(Object.keys(result!)).toEqual([
			'mdi',
			'mdi-light',
			'ic',
			'line-md',
		]);
	});

	test('Get collections asynchronously', () => {
		return new Promise((fulfill, reject) => {
			const provider = nextProvider();
			const collections = getCollections([
				'mdi',
				'mdi-light',
				'ic',
				'line-md',
			]);

			// Check that storage is empty
			expect(getCollectionsList(provider)).toBeUndefined();

			let isSync = true;
			awaitCollectionsList(provider)
				.then((data) => {
					expect(isSync).toBeFalsy();

					const result = getCollectionsList(provider);
					expect(result).toBeDefined();
					expect(Object.keys(result!)).toEqual([
						'mdi',
						'mdi-light',
						'ic',
						'line-md',
					]);

					expect(data).toBe(result);

					fulfill(true);
				})
				.catch(reject);

			// Store
			storeCollectionsList(provider, collections);

			// Get collections list
			expect(getCollectionsList(provider)).toBeDefined();

			isSync = false;
		});
	});
});
