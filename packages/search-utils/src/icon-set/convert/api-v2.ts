import type { IconifyJSON } from '@iconify/types';
import type { APIv2CollectionResponse } from '../../api/types/v2';
import type { IconFinderTagsFilter } from '../../filters/types/filter';
import type { IconFinderIconSet } from '../types/icon-set';
import type {
	IconFinderIconSetIcon,
	IconFinderIconSetUniqueIcon,
} from '../types/icons';
import { getIconSetThemes } from './helpers/themes';

/**
 * Convert icon set from API response
 */
export function convertAPIv2IconSet(
	provider: string,
	data: APIv2CollectionResponse
): IconFinderIconSet | null {
	const { prefix, info, categories } = data;
	if (!info) {
		return null;
	}

	// All icons, value could be identical for several icons
	const map = Object.create(null) as Record<
		string,
		IconFinderIconSetUniqueIcon
	>;

	// Unique icons
	const unique: IconFinderIconSetUniqueIcon[] = [];
	let total = 0;

	// Function to add icon
	const addIcon = (
		name: string,
		tag?: IconFinderTagsFilter,
		hidden?: boolean
	) => {
		let uniqueIcon: IconFinderIconSetUniqueIcon;
		let icon: IconFinderIconSetIcon;
		if (map[name]) {
			// Icon exists
			uniqueIcon = map[name];
			icon = uniqueIcon.icons[0];
		} else {
			// New icon
			icon = {
				name,
			};
			uniqueIcon = {
				icons: [icon],
				hidden: true,
			};
			unique.push(uniqueIcon);
			map[name] = uniqueIcon;
		}

		// Add tags
		if (tag) {
			uniqueIcon.tags = icon.tags = [tag, ...(icon.tags || [])];
		}

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
	const tags = categories || {};
	const tagFilters: IconFinderTagsFilter[] = [];

	// Add icons with tags
	Object.keys(tags).forEach((title, color) => {
		const tag: IconFinderTagsFilter = {
			title,
			color,
		};
		tagFilters.push(tag);

		tags[title].forEach((name) => {
			addIcon(name, tag);
		});
	});

	// Add icons without tags
	const uncategorized = data.uncategorized;
	if (uncategorized && uncategorized.length) {
		let emptyTag: IconFinderTagsFilter | undefined;
		if (tagFilters.length) {
			emptyTag = {
				title: '',
				color: tagFilters.length,
			};
			tagFilters.push(emptyTag);
		}

		uncategorized.forEach((name) => {
			addIcon(name, emptyTag);
		});
	}

	// Add hidden icons
	(data.hidden || []).forEach((name) => {
		addIcon(name, void 0, true);
	});

	// Add aliases
	const aliases = data.aliases || {};
	for (const name in aliases) {
		if (!map[name]) {
			const parent = aliases[name];
			const icon = map[parent];
			if (icon) {
				map[name] = icon;
				icon.icons.push({
					name,
					tags: icon.tags,
					hidden: icon.hidden,
				});
			}
		}
	}

	// Update counter, create icon set
	info.total = total;
	const filters = {} as IconFinderIconSet['filters'];
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
			map,
			unique,
		},
		filters,
	};

	// Get themes
	Object.assign(filters, getIconSetThemes(data as unknown as IconifyJSON));

	// Set tags
	const filtersLength = tagFilters.length;
	if (filtersLength) {
		filters.tags = {
			type: 'tags',
			filters: tagFilters,
			visible: filtersLength,
		};
	}

	return iconSet;
}
