import type { IconifyJSON, IconifyInfo } from '@iconify/types';
import Iconify from '@iconify/iconify';
import type { CollectionData } from '../converters/collection';
import { rawDataToCollection } from '../converters/collection';
import type { CollectionsList } from '../converters/collections';
import { dataToCollections } from '../converters/collections';

/**
 * TypeScript guard
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * How to merge custom icon sets with icon set from API.
 *
 * If set to 'only-custom', API is not queried.
 */
export type IconFinderCustomSetsMerge =
	| 'only-custom'
	| 'custom-first'
	| 'custom-last';

/**
 * Custom icon sets
 */
export interface IconFinderCustomSets {
	// How to merge with icon sets from API.
	// Set to 'only-custom' to show only custom icon sets.
	merge?: IconFinderCustomSetsMerge;

	// Provider to force on all icon sets
	provider?: string;

	// Icon sets data
	iconSets: IconifyJSON[];

	// Custom info blocks
	info?: Record<string, Record<string, unknown> | IconifyInfo>;
}

/**
 * Converted data
 */
interface ConvertedProviderData {
	total: number;
	data: Record<string, CollectionData>;
	collections: CollectionsList;
}

/**
 * Converted data
 */
export interface ConvertedCustomSets {
	// Merge method
	merge: IconFinderCustomSetsMerge;

	// Placeholder
	providers: Record<string, ConvertedProviderData>;
}

/**
 * Empty
 */
export const emptyConvertedSet: ConvertedCustomSets = {
	merge: 'custom-last',
	providers: Object.create(null),
};

/**
 * Convert custom icon sets, return empty set on failure
 */
export function convertCustomSets(
	data: IconFinderCustomSets,
	importIcons = true
): ConvertedCustomSets {
	if (!data.iconSets || !data.iconSets.length) {
		return emptyConvertedSet;
	}

	// Merge
	let merge: IconFinderCustomSetsMerge = 'only-custom';
	switch (data.merge) {
		case 'custom-first':
		case 'custom-last':
		case 'only-custom':
			merge = data.merge;
			break;

		case void 0:
			break;

		default:
			assertNever(data.merge);
	}

	// Set basic data
	const result: ConvertedCustomSets = {
		merge,
		providers: Object.create(null),
	};

	// Info to parse later
	const rawInfo: Record<string, Record<string, IconifyInfo>> = Object.create(
		null
	);

	// Get all providers, add icon sets to Iconify.
	data.iconSets.forEach((item) => {
		if (typeof item.prefix !== 'string') {
			return;
		}

		// Get/set provider
		if (typeof data.provider === 'string') {
			item.provider = data.provider;
		}
		const provider = typeof item.provider === 'string' ? item.provider : '';

		// Custom info block
		if (!item.info && data.info && data.info[item.prefix]) {
			item.info = data.info[item.prefix] as IconifyInfo;
		}

		// Convert data
		const convertedData = rawDataToCollection(item);
		if (!convertedData) {
			return;
		}

		// Add data to result
		if (result.providers[provider] === void 0) {
			result.providers[provider] = {
				total: 0,
				data: Object.create(null),
				collections: {},
			};
		}

		const providerData = result.providers[provider];
		if (providerData.data[convertedData.prefix] !== void 0) {
			// Already exists
			return;
		}

		// Add data
		providerData.data[convertedData.prefix] = convertedData;
		providerData.total++;

		// Store raw info block to convert to collections list later, overwrite count
		if (rawInfo[provider] === void 0) {
			rawInfo[provider] = Object.create(null);
		}
		/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
		const rawItemInfo = Object.assign({}, item.info!);
		rawItemInfo.total = convertedData.total;
		rawInfo[provider][convertedData.prefix] = rawItemInfo;

		// Add icons to Iconify
		if (importIcons) {
			Iconify.addCollection(item);
		}
	});

	// Parse collections lists
	Object.keys(rawInfo).forEach((provider) => {
		result.providers[provider].collections = dataToCollections(
			rawInfo[provider]
		);
	});

	return result;
}