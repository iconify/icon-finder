import type { IconifyJSON } from '@iconify/types';
import type { APIv2CollectionResponse } from '../../api-types/v2';
import type { IconFinderTagsFilter } from '../../filters/types/filter';
import { getBaseIconForTheme } from '../themes/base';
import type { IconFinderIconSet } from '../types/icon-set';
import type {
	IconFinderIconSetIcon,
	IconFinderIconSetUniqueIcon,
} from '../types/icons';
import { convertIconSetTags } from './helpers/tags';
import { getIconSetThemes } from './helpers/themes';

/**
 * Convert icon set from API response
 */
export function convertAPIv2IconSet(
	provider: string,
	data: APIv2CollectionResponse
): IconFinderIconSet | undefined {
	const { prefix, info, categories } = data;
	if (!info) {
		return;
	}

	// Themes
	const filters = getIconSetThemes(
		data as unknown as IconifyJSON
	) as IconFinderIconSet['filters'];

	// All icons, value could be identical for several icons
	const uniqueMap: Map<string, IconFinderIconSetUniqueIcon> = new Map();
	const iconsMap: Map<string, IconFinderIconSetIcon> = new Map();

	// Unique icons
	const unique: IconFinderIconSetUniqueIcon[] = [];
	let total = 0;

	// Function to add icon
	const addIcon = (
		name: string,
		tags?: IconFinderTagsFilter[],
		hidden?: boolean
	) => {
		let uniqueIcon = uniqueMap.get(name);
		let icon: IconFinderIconSetIcon;
		if (uniqueIcon) {
			// Icon exists
			icon = uniqueIcon.icons[0];
		} else {
			// New icon
			icon = {
				name,
				tags,
			};

			// Add prefix/suffix
			if (filters.prefixes) {
				const prefix = getBaseIconForTheme(name, filters.prefixes);
				if (prefix) {
					icon.prefix = prefix.filter;
				}
			}
			if (filters.suffixes) {
				const suffix = getBaseIconForTheme(name, filters.suffixes);
				if (suffix) {
					icon.suffix = suffix.filter;
				}
			}

			// New unique icon
			uniqueIcon = {
				icons: [icon],
				hidden: true,
			};
			unique.push(uniqueIcon);
			uniqueMap.set(name, uniqueIcon);
		}
		iconsMap.set(name, icon);

		// Hide
		if (hidden) {
			uniqueIcon.hidden = icon.hidden = true;
		} else if (uniqueIcon.hidden) {
			// Unhide
			delete uniqueIcon.hidden;
			total++;
		}
	};

	// Generate tags list
	const tagsType = 'tags';
	const tagsData = convertIconSetTags(categories || {});
	const tagFilters = tagsData.filters;
	tagsData.map.forEach((tags, name) => {
		addIcon(name, tags);
	});

	// Add icons without tags
	const uncategorized = data.uncategorized;
	if (uncategorized && uncategorized.length) {
		let emptyTags: IconFinderTagsFilter[] | undefined;
		if (tagFilters.length) {
			const emptyTag = {
				key: tagsType,
				title: '',
				color: tagFilters.length,
			};
			emptyTags = [emptyTag];
			tagFilters.push(emptyTag);
		}

		uncategorized.forEach((name) => {
			addIcon(name, emptyTags);
		});
	}

	// Add hidden icons
	(data.hidden || []).forEach((name) => {
		addIcon(name, void 0, true);
	});

	// Add aliases
	const aliases = data.aliases || {};
	for (const name in aliases) {
		if (!uniqueMap.has(name)) {
			const parent = aliases[name];
			const icon = uniqueMap.get(parent);
			const parentIcon = iconsMap.get(parent);

			// Check if parent icon exists.
			// Not handling circular dependencies, they should not be sent by API v2 and should be handled differently in v3.
			if (icon && parentIcon) {
				uniqueMap.set(name, icon);

				const item = {
					// Copy everything from parent icon, override name
					...parentIcon,
					name,
				};
				iconsMap.set(name, item);
				icon.icons.push(item);
			}
		}
	}

	// Update counter, create icon set
	info.total = total;
	const iconSet: IconFinderIconSet = {
		source: 'api',
		id: {
			provider,
			prefix,
		},
		info,
		title: info.name || prefix,
		total,
		icons: {
			uniqueMap,
			iconsMap,
			unique,
		},
		filters,
		pagination: {},
	};

	// Set tags
	const filtersLength = tagFilters.length;
	if (filtersLength) {
		filters.tags = {
			type: tagsType,
			filters: tagFilters,
			visible: filtersLength,
		};
	}

	return iconSet;
}
