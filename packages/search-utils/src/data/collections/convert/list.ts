import type { IconifyInfo } from '@iconify/types';
import { convertIconSetInfo } from '@iconify/utils/lib/icon-set/convert-info';
import type { IconFinderCategoriesFilter } from '../../filters/types/filter';
import type {
	IconFinderCollectionsCategory,
	IconFinderCollectionsList,
	IconFinderCollectionsListItem,
} from '../types/collections';
import { finaliseCollectionsList } from './finalise';

/**
 * Convert collections.json to collections list
 */
export function convertCollectionsList(
	collections: Record<string, IconifyInfo>
): IconFinderCollectionsList {
	// Create result
	const result: IconFinderCollectionsList = {
		search: '',
		categorised: Object.create(
			null
		) as IconFinderCollectionsList['categorised'],
		prefixed: Object.create(null) as IconFinderCollectionsList['prefixed'],
		filters: {},
		visible: 0,
		total: 0,
	};

	// Create empty category
	const categoryPrefix = 'category-';
	const emptyCategory: IconFinderCollectionsCategory = {
		title: '',
		items: [],
		filter: {
			key: categoryPrefix,
			title: '',
		},
		visible: 0,
	};

	// Parse all items
	let iconSetColor = 0;
	let filterColor = 0;
	for (const prefix in collections) {
		if (result.prefixed[prefix]) {
			// Duplicate item
			// TODO: assign to multiple categories???
			continue;
		}

		const info = convertIconSetInfo(collections[prefix]);
		if (!info) {
			// Invalid icon set
			continue;
		}

		const category = info.category || '';
		const title = info.name || prefix;

		const item: IconFinderCollectionsListItem = {
			prefix,
			title,
			info,
			category,
			color: iconSetColor++,
		};
		result.prefixed[prefix] = item;

		let categoryItem: IconFinderCollectionsCategory;
		if (!category) {
			categoryItem = emptyCategory;
		} else {
			categoryItem = result.categorised[category];
			if (!categoryItem) {
				// New category
				const filter: IconFinderCategoriesFilter = {
					key: categoryPrefix + category,
					title: category,
					color: filterColor++,
				};
				result.categorised[category] = {
					title: category,
					items: [item],
					filter,
					visible: 0,
				};
				continue;
			}
		}

		// Existing category
		categoryItem.items.push(item);
	}

	// Add empty category
	if (emptyCategory.items.length) {
		emptyCategory.filter.color = filterColor++;
		result.categorised[emptyCategory.title] = emptyCategory;
	}

	// Update counters and filters
	finaliseCollectionsList(result);

	return result;
}
