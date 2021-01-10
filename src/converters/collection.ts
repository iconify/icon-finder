/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IconifyJSON, IconifyChars } from '@iconify/types';
import type { Icon } from '../misc/icon';
import type { CollectionInfo } from './info';
import { dataToCollectionInfo } from './info';

/**
 * Collection
 *
 * Important: keys for filters must match keys in CollectionViewBlocksIconFilters interface for easy iteration!
 */
export interface CollectionData {
	// Provider
	provider: string;

	// Prefix
	prefix: string;

	// Duplicate data from info. Must exist in either info or in root object
	name: string;
	total: number;

	// Collection info block
	info?: CollectionInfo;

	// List of icons
	icons: Icon[];

	// List of hidden icons, if exists
	hidden?: string[];

	// List of available tags, prefixes and suffixed
	tags?: string[];
	themePrefixes?: string[];
	themeSuffixes?: string[];
}

/**
 * Interface for categories with possibility of sub-categories
 */
type Categories = Record<string, string[] | Record<string, string[]>>;

/**
 * Parse themes
 */
function parseThemes(
	iconSet: IconifyJSON,
	sortedIcons: Icon[],
	result: CollectionData
): void {
	interface ThemeData {
		hasEmpty: boolean;
		hasUncategorized: boolean;
		values: string[];
		titles: Record<string, string>;
		found: Record<string, number>;
		test: (name: string, test: string) => boolean;
	}
	type ThemeType = 'prefix' | 'suffix';
	const data: Record<ThemeType, ThemeData> = {
		prefix: {
			hasEmpty: false,
			hasUncategorized: false,
			values: [],
			titles: Object.create(null),
			found: Object.create(null),
			test: (name, test) => name.slice(0, test.length) === test,
		},
		suffix: {
			hasEmpty: false,
			hasUncategorized: false,
			values: [],
			titles: Object.create(null),
			found: Object.create(null),
			test: (name, test) => name.slice(0 - test.length) === test,
		},
	};

	const keys: ThemeType[] = ['prefix', 'suffix'];

	// Converted icon set data, using ThemeType as key, new theme format as value
	const iconSetData: Record<ThemeType, Record<string, string> | null> = {
		prefix: null,
		suffix: null,
	};

	// Convert legacy format
	if (typeof iconSet.themes === 'object' && iconSet.themes) {
		const themes = iconSet.themes;
		Object.keys(themes).forEach((key) => {
			const theme = themes[key];
			keys.forEach((attr) => {
				const prop = attr as keyof typeof theme;
				if (typeof theme[prop] === 'string') {
					// Has prefix or suffix
					const value = theme[prop]!;
					if (iconSetData[attr] === null) {
						iconSetData[attr] = Object.create(null);
					}
					iconSetData[attr]![value] = theme.title;
				}
			});
		});
	}

	// Check themes
	keys.forEach((key) => {
		const attr = (key + 'es') as keyof IconifyJSON;
		if (typeof iconSet[attr] === 'object' && iconSet[attr] !== null) {
			// Prefixes or suffixes exist: overwrite old entry
			iconSetData[key] = iconSet[attr] as Record<string, string>;
		}

		if (!iconSetData[key]) {
			// No prefix or suffix? Delete entry in data
			delete data[key];
			return;
		}

		// Validate themes
		const dataItem = data[key];
		const theme = iconSetData[key]!;
		Object.keys(theme).forEach((value) => {
			const title = theme[value];

			if (value !== '') {
				// Check for '-' at start or end
				switch (key) {
					case 'prefix':
						if (value.slice(-1) !== '-') {
							value += '-';
						}
						break;

					case 'suffix':
						if (value.slice(0, 1) !== '-') {
							value = '-' + value;
						}
						break;
				}
			}

			if (dataItem.titles[value] !== void 0) {
				// Duplicate entry
				return;
			}

			// Add value
			if (value === '') {
				dataItem.hasEmpty = true;
			} else {
				dataItem.values.push(value);
			}

			// Set data
			dataItem.titles[value] = title;
			dataItem.found[value] = 0;
		});

		// Check if theme is empty
		if (!Object.keys(dataItem.titles).length) {
			delete data[key];
		}
	});

	// Check stuff
	Object.keys(data).forEach((attr) => {
		const dataItem = data[attr as keyof typeof data];
		const matches = dataItem.values;
		const iconKey = attr === 'prefix' ? 'themePrefixes' : 'themeSuffixes';

		// Sort matches by length, then alphabetically
		matches.sort((a, b) =>
			a.length === b.length ? a.localeCompare(b) : b.length - a.length
		);

		// Check all icons
		sortedIcons.forEach((icon) => {
			// Check icon
			(icon.aliases
				? [icon.name].concat(icon.aliases)
				: [icon.name]
			).forEach((name, index) => {
				// Find match
				let theme: string | null = null;
				for (let i = 0; i < matches.length; i++) {
					const match = matches[i];
					if (dataItem.test(name, match)) {
						// Found matching theme
						dataItem.found[match]++;
						theme = match;
						break;
					}
				}
				if (theme === null && dataItem.hasEmpty && !index) {
					// Empty prefix/suffix, but do not test aliases
					theme = '';
					dataItem.found['']++;
				}

				// Get title
				const title = theme === null ? '' : dataItem.titles[theme];

				// Not found
				if (theme === null) {
					if (index > 0) {
						return;
					}
					// Uncategorized
					dataItem.hasUncategorized = true;
					theme = '';
				}

				// Found
				if (icon[iconKey] === void 0) {
					icon[iconKey] = [title];
					return;
				}
				const titles = icon[iconKey]!;
				if (titles.indexOf(title) === -1) {
					titles.push(title);
				}
			});
		});

		// Add result
		const titles: string[] = [];
		Object.keys(dataItem.titles).forEach((match) => {
			if (dataItem.found[match]) {
				titles.push(dataItem.titles[match]);
			}
		});
		if (dataItem.hasUncategorized) {
			titles.push('');
		}

		switch (titles.length) {
			case 0:
				// Nothing to do
				break;

			case 1:
				// 1 theme: remove all entries
				sortedIcons.forEach((icon) => {
					delete icon[iconKey];
				});
				break;

			default:
				// Many entries
				result[iconKey] = titles;
		}
	});
}

/**
 * Parse characters map
 */
function parseChars(chars: IconifyChars, icons: Record<string, Icon>): void {
	Object.keys(chars).forEach((char) => {
		const name = chars[char];
		if (icons[name] !== void 0) {
			const icon = icons[name];
			if (icon.chars === void 0) {
				icon.chars = [];
			}
			icon.chars.push(char);
		}
	});
}

/**
 * Convert icons to sorted array
 */
function sortIcons(icons: Record<string, Icon>): Icon[] {
	const sortedIcons: Icon[] = [];
	Object.keys(icons)
		.sort((a, b) => a.localeCompare(b))
		.forEach((name) => {
			sortedIcons.push(icons[name]);
		});
	return sortedIcons;
}

/**
 * Convert collection data
 */
export function dataToCollection(
	provider: string,
	data: unknown
): CollectionData | null {
	if (typeof data !== 'object' || data === null) {
		return null;
	}

	const source = data as Record<string, unknown>;

	// Check required fields
	if (typeof source.prefix !== 'string') {
		return null;
	}

	// Create result
	const result: CollectionData = {
		provider,
		prefix: source.prefix,
		name: '',
		total: 0,
		icons: [],
	};

	// Get info
	if (typeof source.info === 'object' && source.info !== null) {
		const info = dataToCollectionInfo(source.info, result.prefix);
		if (info === null) {
			// Invalid info block, so something is wrong
			return null;
		}
		result.info = info;
	}

	// Get collection name
	if (typeof source.name === 'string') {
		result.name = source.name;
	} else if (typeof source.title === 'string') {
		// Correct API response
		result.name = source.title;
	} else if (result.info !== void 0) {
		result.name = result.info.name;
	} else {
		return null;
	}

	// Check for categories
	let tags: string[] =
		typeof source.categories === 'object' && source.categories !== null
			? Object.keys(source.categories)
			: [];

	let hasUncategorised = false,
		uncategorisedKey = 'uncategorized';

	['uncategorized', 'uncategorised'].forEach((attr) => {
		if (
			typeof source[attr] === 'object' &&
			source[attr] instanceof Array &&
			(source[attr] as string[]).length > 0
		) {
			uncategorisedKey = attr;
			hasUncategorised = true;
		}
	});

	// Find all icons
	const icons: Record<string, Icon> = Object.create(null);

	function addCategory(iconsList: string[], category: string): boolean {
		let added = false;
		iconsList.forEach((name) => {
			if (typeof name !== 'string') {
				return;
			}

			added = true;
			if (icons[name] === void 0) {
				// Add new icon
				const icon: Icon = {
					provider,
					prefix: result.prefix,
					name,
					tags: [category],
				};
				icons[name] = icon;
				return;
			}

			// Add tag to existing icon
			if (icons[name].tags === void 0) {
				icons[name].tags = [];
			}
			if (icons[name].tags!.indexOf(category) === -1) {
				icons[name].tags!.push(category);
			}
		});
		return added;
	}

	tags = tags.filter((category) => {
		let added = false;
		const categoryItems = (source.categories as Categories)[category];
		if (categoryItems instanceof Array) {
			added = addCategory(categoryItems, category);
		} else {
			Object.keys(categoryItems).forEach((subcategory) => {
				const subcategoryItems = categoryItems[subcategory];
				if (subcategoryItems instanceof Array) {
					added = addCategory(subcategoryItems, category) || added;
				}
			});
		}
		return added;
	});
	const hasTags = tags.length > 0;

	// Add uncategorised icons
	if (hasUncategorised) {
		const list = source[uncategorisedKey] as string[];
		list.forEach((name) => {
			if (typeof name !== 'string') {
				return;
			}
			if (icons[name] === void 0) {
				// Add new icon
				const icon: Icon = {
					provider,
					prefix: result.prefix,
					name: name,
				};
				if (hasTags) {
					icon.tags = [''];
				}
				icons[name] = icon;
				return;
			}
		});
		if (hasTags) {
			tags.push('');
		}
	}

	// Add characters
	if (typeof source.chars === 'object') {
		parseChars(source.chars as IconifyChars, icons);
	}

	// Add aliases
	const missingAliases: Record<string, string[]> = Object.create(null);
	if (typeof source.aliases === 'object') {
		const aliases = source.aliases as Record<string, string>;
		Object.keys(aliases).forEach((alias) => {
			const name = aliases[alias];
			if (icons[name] !== void 0) {
				const icon = icons[name];
				if (icon.aliases === void 0) {
					icon.aliases = [];
				}
				icon.aliases.push(alias);
				return;
			}

			// Alias is not found. Hidden icon?
			if (missingAliases[name] === void 0) {
				missingAliases[name] = [];
			}
			missingAliases[name].push(alias);
		});
	}

	// Add hidden icons
	if (source.hidden instanceof Array) {
		let hidden: string[] = [];

		source.hidden.forEach((icon: string) => {
			// Add icon
			hidden.push(icon);

			// Look for aliases of hidden icon
			if (missingAliases[icon] !== void 0) {
				hidden = hidden.concat(missingAliases[icon]);
			}
		});

		result.hidden = hidden;
	}

	// Convert to sorted array
	const sortedIcons = sortIcons(icons);

	// Check tags
	if (tags.length > 1) {
		result.tags = tags.sort(sortTags);
	} else if (hasTags) {
		// Only one tag - delete tags
		sortedIcons.forEach((icon) => {
			delete icon.tags;
		});
	}

	// Add themes
	parseThemes((source as unknown) as IconifyJSON, sortedIcons, result);

	// Add icons
	result.icons = sortedIcons;
	result.total = result.icons.length;
	if (result.info) {
		result.info.total = result.total;
	}

	return result;
}

/**
 * Convert raw data from icon set
 */
export function rawDataToCollection(
	source: IconifyJSON
): CollectionData | null {
	/**
	 * Add icon
	 */
	function addIcon(name: string, depth = 0): string | null {
		if (depth > 3) {
			// Alias recursion is too high. Do not make aliases of aliases.
			return null;
		}

		if (icons[name] !== void 0) {
			// Already added
			return name;
		}

		// Add icon
		if (source.icons[name] !== void 0) {
			if (!source.icons[name].hidden) {
				icons[name] = {
					provider: result.provider,
					prefix: result.prefix,
					name,
					tags: [],
				};
				return name;
			}
			return null;
		}

		// Add alias
		if (
			source.aliases &&
			source.aliases[name] !== void 0 &&
			!source.aliases[name].hidden
		) {
			// Resolve alias
			const item = source.aliases[name];
			const parent = item.parent;

			// Add parent icon
			const added = addIcon(parent, depth + 1);
			if (added !== null) {
				// Icon was added, which means parent icon is a viable icon
				// Check if new icon is an alias or full icon
				if (!(item.rotate || item.hFlip || item.vFlip)) {
					// Alias
					const parentIcon = icons[added];
					if (!parentIcon.aliases) {
						parentIcon.aliases = [name];
					} else if (parentIcon.aliases.indexOf(name) === -1) {
						parentIcon.aliases.push(name);
					}
					return added;
				} else {
					// New icon
					icons[name] = {
						provider: result.provider,
						prefix: result.prefix,
						name,
						tags: [],
					};
					return name;
				}
			}
		}

		return null;
	}

	/**
	 * Add tag to icons
	 */
	function addTag(iconsList: string[], tag: string): boolean {
		let added = false;
		iconsList.forEach((name) => {
			if (
				icons[name] !== void 0 &&
				icons[name].tags!.indexOf(tag) === -1
			) {
				icons[name].tags!.push(tag);
				added = true;
			}
		});
		return added;
	}

	// Check required fields
	if (typeof source.prefix !== 'string') {
		return null;
	}

	const result: CollectionData = {
		provider: typeof source.provider === 'string' ? source.provider : '',
		prefix: source.prefix,
		name: '',
		total: 0,
		icons: [],
	};

	// Get required info
	if (typeof source.info !== 'object' || source.info === null) {
		return null;
	}

	const info = dataToCollectionInfo(source.info, result.prefix);
	if (info === null) {
		// Invalid info block, so something is wrong
		return null;
	}
	result.info = info;

	// Get collection name
	result.name = result.info.name;

	// Find all icons
	const icons: Record<string, Icon> = Object.create(null);
	Object.keys(source.icons).forEach((name) => addIcon(name));
	if (typeof source.aliases === 'object') {
		Object.keys(source.aliases).forEach((name) => addIcon(name));
	}
	const iconNames = Object.keys(icons);

	// Check for categories
	const tags: string[] = [];
	if (typeof source.categories === 'object' && source.categories !== null) {
		let hasUncategorised = false;
		const categories = source.categories as Categories;
		Object.keys(categories).forEach((category) => {
			const categoryItems = categories[category];

			// Array
			if (categoryItems instanceof Array) {
				if (addTag(categoryItems, category)) {
					tags.push(category);
				}
			} else if (typeof categoryItems === 'object') {
				// Sub-categories. No longer used, but can be found in some older icon sets
				Object.keys(categoryItems).forEach((subcategory) => {
					const subcategoryItems = categoryItems[subcategory];
					if (subcategoryItems instanceof Array) {
						if (
							addTag(subcategoryItems, category) &&
							tags.indexOf(category) === -1
						) {
							tags.push(category);
						}
					}
				});
			}
		});

		// Check if icons without categories exist
		iconNames.forEach((name) => {
			if (!icons[name].tags!.length) {
				icons[name].tags!.push('');
				hasUncategorised = true;
			}
		});
		if (hasUncategorised) {
			tags.push('');
		}
	}

	// Remove tags if there are less than 2 categories
	if (tags.length < 2) {
		Object.keys(icons).forEach((name) => {
			delete icons[name].tags;
		});
	} else {
		result.tags = tags.sort(sortTags);
	}

	// Add characters
	if (typeof source.chars === 'object') {
		parseChars(source.chars, icons);
	}

	// Sort icons
	const sortedIcons = sortIcons(icons);

	// Add themes
	parseThemes(source, sortedIcons, result);

	// Add icons
	result.icons = sortedIcons;
	result.total = result.info.total = result.icons.length;

	return result;
}

/**
 * Sort categories
 */
function sortTags(a: string, b: string): number {
	if (a === '') {
		return 1;
	}
	if (b === '') {
		return -1;
	}
	return a.localeCompare(b);
}
