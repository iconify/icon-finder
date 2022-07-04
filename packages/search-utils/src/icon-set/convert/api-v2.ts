import type { IconifyJSON } from '@iconify/types';
import type { APIv2CollectionResponse } from '../../api/types/v2';
import type { IconFinderIconSetCategory } from '../types/category';
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
		category?: IconFinderIconSetCategory,
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
				render: name,
			};
			unique.push(uniqueIcon);
			map[name] = uniqueIcon;

			if (!hidden) {
				// New visible icon
				total++;
			}
		}

		// Add category
		if (category) {
			uniqueIcon.categories = icon.categories = [
				category,
				...(icon.categories || []),
			];
		}

		// Hide
		if (hidden) {
			uniqueIcon.hidden = icon.hidden = true;
		}
	};

	// Generate categories list
	const categories2 = categories || {};
	const categoryItems: IconFinderIconSetCategory[] = [];

	// Add icons with categories
	Object.keys(categories2).forEach((title, color) => {
		const category: IconFinderIconSetCategory = {
			title,
			color,
		};
		categoryItems.push(category);

		categories2[title].forEach((name) => {
			addIcon(name, category);
		});
	});

	// Add icons without categories
	const uncategorized = data.uncategorized;
	if (uncategorized && uncategorized.length) {
		let emptyCategory: IconFinderIconSetCategory | undefined;
		if (categoryItems.length) {
			emptyCategory = {
				title: '',
				color: categoryItems.length,
			};
			categoryItems.push(emptyCategory);
		}

		uncategorized.forEach((name) => {
			addIcon(name, emptyCategory);
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
					categories: icon.categories,
					hidden: icon.hidden,
				});
			}
		}
	}

	// Update counter, create icon set
	info.total = total;
	const iconSet: IconFinderIconSet = {
		provider,
		prefix,
		info,
		title: info.name || prefix,
		total,
		source: 'api',
		icons: {
			map,
			unique,
		},
	};

	// Get themes
	Object.assign(iconSet, getIconSetThemes(data as unknown as IconifyJSON));

	// Set categories
	if (categoryItems.length) {
		iconSet.categories = categoryItems;
	}

	return iconSet;
}
