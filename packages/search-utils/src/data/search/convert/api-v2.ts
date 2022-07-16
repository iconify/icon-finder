import { stringToIcon } from '@iconify/utils/lib/icon/name';
import type { APIv2SearchResponse } from '../../../api/types/v2';
import { getCollectionsListItemsFromStorage } from '../../../storage/data/collections';
import type { IconFinderCollectionsFilter } from '../../filters/types/filter';
import type { IconFinderCollectionsFiltersList } from '../../filters/types/list';
import type { IconFinderGenericIconName } from '../../icon/types/name';
import type { IconFinderSearchResults } from '../types/results';

/**
 * Convert search results
 */
export function convertAPIv2SearchResults(
	// API provider
	provider: string,
	// Response
	data: APIv2SearchResponse
): IconFinderSearchResults {
	const collectionsList = getCollectionsListItemsFromStorage(provider);
	const collections: Map<string, IconFinderCollectionsFilter> = new Map();
	const icons: IconFinderGenericIconName[] = [];

	const filterType = 'collections';
	let color = 0;
	data.icons.forEach((item) => {
		const iconName = stringToIcon(item, true);
		if (!iconName) {
			return;
		}
		const { prefix, name } = iconName;

		// Add icon set filter
		if (!collections.has(prefix)) {
			let collection: IconFinderCollectionsFilter;
			const listItem = collectionsList?.[prefix];
			if (listItem) {
				// Copy filter from list
				collection = {
					key: filterType + prefix,
					prefix,
					title: listItem.title,
					color: listItem.color,
				};
			} else {
				const responseItem = data.collections?.[prefix];
				if (!responseItem) {
					return;
				}
				collection = {
					key: filterType + prefix,
					prefix,
					title: responseItem.name,
					color: color++,
				};
			}

			collections.set(prefix, collection);
		}

		// Add icon
		icons.push({
			provider,
			prefix,
			name,
		});
	});

	// Filters object
	const collectionsFilters: IconFinderCollectionsFiltersList = {
		type: filterType,
		collections,
		filters: Array.from(collections.values()),
		visible: collections.size,
	};

	// Return list
	return {
		// Icons list
		type: 'generic',
		icons,
		filters: {
			[filterType]: collectionsFilters,
		},

		// Custom stuff
		gotMaxResults: data.total >= data.limit,
	};
}
