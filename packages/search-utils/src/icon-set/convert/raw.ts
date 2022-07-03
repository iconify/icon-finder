import type { IconifyJSON } from 'iconify-icon';
import type { FullExtendedIconifyIcon } from '@iconify/utils/lib/icon/defaults';
import { defaultIconProps } from '@iconify/utils/lib/icon/defaults';
import { getIconsTree } from '@iconify/utils/lib/icon-set/tree';
import { internalGetIconData } from '@iconify/utils/lib/icon-set/get-icon';
import {
	commonObjectProps,
	unmergeObjects,
} from '@iconify/utils/lib/misc/objects';
import type { IconFinderIconSetCategory } from '../types/category';
import type { IconFinderIconSet } from '../types/icon-set';
import type {
	IconFinderIconSetIcon,
	IconFinderIconSetUniqueIcon,
} from '../types/icons';
import { hashString } from './helpers/hash';
import { getIconSetThemes } from './helpers/themes';

/**
 * Convert raw icon set
 */
export function convertRawIconSet(
	provider: string,
	data: IconifyJSON
): IconFinderIconSet | null {
	const { prefix, info, categories } = data;
	if (!info) {
		return null;
	}

	// Default props
	const defaults = Object.assign({}, defaultIconProps);
	for (const key in defaults) {
		// TypeScript shenanigans
		const customValue = data[key as 'width'];
		if (typeof customValue === typeof defaults[key as 'width']) {
			defaults[key as 'width'] = customValue as number;
		}
	}

	// Number of visible icons
	let total = 0;

	// All icons, value could be identical for several icons
	const map = Object.create(null) as Record<
		string,
		IconFinderIconSetUniqueIcon
	>;

	// Unique icons
	const unique: IconFinderIconSetUniqueIcon[] = [];

	// Icons list by hashes of icon data to detect clones
	const duplicatesList = Object.create(null) as Record<
		string,
		IconFinderIconSetUniqueIcon
	>;

	// Transformations, based on body hash
	const transformationsList = Object.create(null) as Record<
		string,
		Set<IconFinderIconSetUniqueIcon>
	>;

	// Generate categories list
	const categories2 = categories || {};
	const categoryItems: IconFinderIconSetCategory[] = Object.keys(
		categories2
	).map((title, color) => {
		return {
			title,
			color,
		};
	});
	const emptyCategory: IconFinderIconSetCategory = {
		title: '',
		color: categoryItems.length,
	};
	let hasUncategorised = false;

	// Get categories for icons tree
	function getCategoriesForIcons(
		tree: string[]
	): IconFinderIconSetCategory[] {
		for (let i = 0; i < tree.length; i++) {
			const name = tree[i];
			const result = categoryItems.filter((item) => {
				const title = item.title;
				return categories2[title].indexOf(name) !== -1;
			});
			if (result.length) {
				return result;
			}
		}

		// Icon is not listed in any category
		hasUncategorised = true;
		return [emptyCategory];
	}

	// Parse all icons
	const tree = getIconsTree(data);
	for (const name in tree) {
		const parents = tree[name];
		if (!parents) {
			// Failed icon
			continue;
		}

		// Resolve icon
		const resolved: FullExtendedIconifyIcon = {
			...defaultIconProps,
			...internalGetIconData(data, name, parents),
		};
		const hidden = resolved.hidden;

		// Hash content to find similar icons
		const contentHash = hashString(resolved.body);

		// Remove default properties and properties that do not belong to icon
		const customisedProps = commonObjectProps(
			unmergeObjects(resolved, defaultIconProps),
			defaultIconProps
		);

		// Create icon
		const icon: IconFinderIconSetIcon = {
			name,
		};
		hidden && (icon.hidden = true);

		// Check for duplicate
		const dupeCheckKey = JSON.stringify({
			contentHash,
			customisedProps,
		});
		let uniqueIcon = duplicatesList[dupeCheckKey];

		if (uniqueIcon) {
			// Found duplicate: add as alias
			if (!hidden && uniqueIcon.hidden) {
				// Clone is hidden, but icon is visible: set visible icon as primary
				uniqueIcon.render = name;
				uniqueIcon.icons.unshift(icon);
				delete uniqueIcon.hidden;
				total++;
			} else {
				uniqueIcon.icons.push(icon);
			}
		} else {
			// Create icon
			uniqueIcon = {
				icons: [icon],
				render: name,
			};
			hidden ? (uniqueIcon.hidden = true) : total++;

			// Add icon
			duplicatesList[dupeCheckKey] = uniqueIcon;
			unique.push(uniqueIcon);
		}

		// Add icon
		map[name] = uniqueIcon;

		// Add to transformation
		(
			transformationsList[contentHash] ||
			(transformationsList[contentHash] = new Set())
		).add(uniqueIcon);

		// Add categories
		const iconCategories =
			categories &&
			!hidden &&
			getCategoriesForIcons([name].concat(parents));
		if (iconCategories) {
			icon.categories = iconCategories;
			uniqueIcon.categories = Array.from(
				new Set(iconCategories.concat(uniqueIcon.categories || []))
			);
		}
	}

	// Convert transformations to arrays, add to items that do have them
	for (const hash in transformationsList) {
		const list = Array.from(transformationsList[hash]);
		if (list.length > 1) {
			list.forEach((item, index) => {
				item.transformations = list
					.slice(0, index)
					.concat(list.slice(index + 1))
					.map((item) => item.render);
			});
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
		source: 'raw',
		icons: {
			map,
			unique,
		},
	};

	// Get themes
	Object.assign(iconSet, getIconSetThemes(data));

	// Set categories
	if (categories) {
		if (hasUncategorised) {
			categoryItems.push(emptyCategory);
		}
		iconSet.categories = categoryItems;
	}

	return iconSet;
}
