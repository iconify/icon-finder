import type { IconFinderTagsFilter } from '../../../filters/types/filter';

interface ConvertIconSetTagsResult {
	// All filters
	filters: IconFinderTagsFilter[];

	// Filters for each icon
	map: Map<string, IconFinderTagsFilter[]>;
}

/**
 * Convert icon set tags
 */
export function convertIconSetTags(
	tags: Record<string, string[]>
): ConvertIconSetTagsResult {
	const tagsType = 'tags';
	const filters = [] as IconFinderTagsFilter[];
	const map: Map<string, IconFinderTagsFilter[]> = new Map();

	const titles = Object.keys(tags).sort((a, b) => a.localeCompare(b));
	titles.forEach((title, color) => {
		// Create filter
		const tag: IconFinderTagsFilter = {
			key: tagsType + title,
			title,
			color,
		};
		filters.push(tag);

		// Add filter to all icons
		tags[title].forEach((name) => {
			map.get(name)?.push(tag) || map.set(name, [tag]);
		});
	});

	return {
		filters,
		map,
	};
}
