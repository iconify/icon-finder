import type { IconifyOptional } from '@iconify/types';
import type { IconifyJSON } from 'iconify-icon';
import { mergeIconData } from '@iconify/utils/lib/icon/merge';
import { defaultIconProps } from '@iconify/utils/lib/icon/defaults';
import type { IconFinderIconSetCategory } from '../types/category';
import type { IconFinderIconSet } from '../types/icon-set';
import type {
	IconFinderIconSetIcon,
	IconFinderIconSetUniqueIcon,
} from '../types/icons';
import { hashIconBody } from './helpers/hash';
import { getIconSetThemes } from './helpers/themes';

/**
 * Convert raw icon set
 */
export function convertRawIconSet(
	provider: string,
	data: IconifyJSON
): IconFinderIconSet | null {
	const { prefix, info, icons, categories } = data;
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

	// List of pending parent icons and failed aliases
	const failedAliases: Set<string> = new Set();

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
	function getCategoriesForIcon(
		name: string,
		returnDefault: boolean
	): IconFinderIconSetCategory[] | undefined {
		const result = categoryItems.filter((item) => {
			const title = item.title;
			return categories2[title].indexOf(name) !== -1;
		});
		if (result.length) {
			return result;
		}

		if (returnDefault) {
			// Icon is not listed in any category
			hasUncategorised = true;
			return [emptyCategory];
		}
	}

	// Merge properties
	// Some TypeScript shenanigans used
	function mergeProps(
		parentProps: IconifyOptional,
		iconProps: IconifyOptional
	): IconifyOptional {
		const result = mergeIconData(parentProps, iconProps);
		for (const key in defaults) {
			const attr = key as keyof IconifyOptional;
			const defaultValue = defaults[attr];
			const customValue = iconProps[attr];
			if (typeof customValue === typeof defaultValue) {
				// Same type: merge it
				const oldValue = parentProps[attr];
				let newValue: typeof oldValue;
				switch (attr) {
					case 'rotate':
						newValue =
							((customValue as typeof defaultIconProps['rotate']) +
								((oldValue as typeof parentProps['rotate']) ||
									0)) %
							4;
						break;

					case 'hFlip':
					case 'vFlip':
						newValue = !!customValue !== !!oldValue;
						break;

					default:
						newValue =
							customValue as typeof defaultIconProps[typeof attr];
				}

				if (newValue !== defaultValue) {
					// Add only items that do not match default values
					result[attr as 'width'] = newValue as number;
				}
			}
		}
		return result;
	}

	// Check for variations and duplicates
	function checkAndAddIcon(
		name: string,
		hidden: boolean,
		contentHash: string,
		customisedProps: IconifyOptional,
		iconCategories: IconFinderIconSetCategory[] | false | undefined
	) {
		// Create icon
		const icon: IconFinderIconSetIcon = {
			name,
		};
		hidden && (icon.hidden = true);

		// Add categories
		if (iconCategories) {
			icon.categories = iconCategories;
		}

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
		if (iconCategories) {
			uniqueIcon.categories = Array.from(
				new Set(iconCategories.concat(uniqueIcon.categories || []))
			);
		}
	}

	// Add alias
	function addAlias(name: string) {
		if (map[name] || failedAliases.has(name)) {
			// Already added or failed
			return;
		}
		const pending: Set<string> = new Set();

		function loop(name: string): IconFinderIconSetUniqueIcon | undefined {
			pending.add(name);
			const alias = aliases[name];
			const parent = alias.parent;

			let parentItem: IconFinderIconSetUniqueIcon | undefined =
				map[parent];
			if (
				// If parentITem is missing
				!parentItem &&
				// If parent failed or pending -> fail
				(failedAliases.has(parent) ||
					pending.has(parent) ||
					// Attempt to resolve parent
					!(parentItem = loop(parent)))
			) {
				// Failed
				failedAliases.add(name);
				return;
			}

			// Success! Merge with parent
		}
		loop(name);
	}

	// Parse all icons
	for (const name in icons) {
		const item = icons[name];
		const props = mergeProps({}, item);

		// Get content and hash it
		const hash = hashIconBody(item.body);

		const hidden = !!item.hidden;
		checkAndAddIcon(
			name,
			hidden,
			hash,
			props,
			categories && !hidden && getCategoriesForIcon(name, true)
		);
	}

	// Add aliases
	const aliases = data.aliases || {};
	for (const name in aliases) {
		addAlias(name);
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
