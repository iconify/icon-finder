import { _api } from 'iconify-icon';
import type { APIv2SearchResponse } from '../../api-types/v2';
import { waitForCollectionsFromAPIv2 } from '../../collections/loaders/api-v2';
import type {
	StoredIconFinderSearchQuery,
	StoredIconFinderSearchResults,
} from '../types/storage';
import type { IconFinderStorageError } from '../../storage/types';
import { convertAPIv2SearchResults } from '../convert/api-v2';

/**
 * Load search results
 */
export function searchAPIv2Loader(
	query: StoredIconFinderSearchQuery
): Promise<StoredIconFinderSearchResults | IconFinderStorageError> {
	return new Promise((fulfill) => {
		const { provider, keyword, limit, category, prefixes } = query;
		const urlParams = new URLSearchParams({
			query: keyword,
			limit: limit.toString(),
		});
		if (category) {
			urlParams.set('category', category);
		}
		if (prefixes) {
			urlParams.set('prefixes', prefixes.join(','));
		}

		// Send query
		_api.sendAPIQuery(
			provider,
			{
				type: 'custom',
				provider,
				uri: '/search?' + urlParams.toString(),
			},
			waitForCollectionsFromAPIv2(
				provider,
				(data) => {
					const results = convertAPIv2SearchResults(
						provider,
						data as APIv2SearchResponse
					);
					fulfill(results || 503);
				},
				fulfill
			)
		);
	});
}
