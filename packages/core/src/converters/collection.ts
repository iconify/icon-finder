import { IconifyInfo, IconifyThemes } from '@iconify/types';
import { Icon } from '../icon';

const minDisplayHeight = 16;
const maxDisplayHeight = 24;

/**
 * Collection information
 */
export interface CollectionInfo extends IconifyInfo {
	// Prefix
	prefix: string;

	// Index for color rotation
	index?: number;
}

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

	// List of available tags, prefixes and suffixed
	tags?: string[];
	themePrefixes?: string[];
	themeSuffixes?: string[];
}

/**
 * Convert data from API to CollectionInfo
 */
export function dataToCollectionInfo(
	data: unknown,
	expectedPrefix = ''
): CollectionInfo | null {
	if (typeof data !== 'object' || data === null) {
		return null;
	}

	const source = data as Record<string, unknown>;

	const getSourceNestedString = (
		field: string,
		key: string,
		defaultValue = ''
	): string => {
		if (typeof source[field] !== 'object') {
			return defaultValue;
		}
		const obj = source[field] as Record<string, string>;
		return typeof obj[key] === 'string' ? obj[key] : defaultValue;
	};

	// Get name
	let name: string;
	if (typeof source.name === 'string') {
		name = source.name as string;
	} else if (typeof source.title === 'string') {
		name = source.title as string;
	} else {
		return null;
	}

	// Get prefix
	let prefix;
	if (expectedPrefix === '') {
		if (typeof source.prefix !== 'string') {
			return null;
		}
		prefix = source.prefix;
	} else {
		if (
			typeof source.prefix === 'string' &&
			source.prefix !== expectedPrefix
		) {
			// Prefixes do not match
			return null;
		}
		prefix = expectedPrefix;
	}

	// Generate data
	const result: CollectionInfo = {
		prefix: prefix,
		name: name,
		total: typeof source.total === 'number' ? source.total : 0,
		version: typeof source.version === 'string' ? source.version : '',
		author: {
			name: getSourceNestedString(
				'author',
				'name',
				typeof source.author === 'string' ? source.author : 'Unknown'
			),
			url: getSourceNestedString('author', 'url', ''),
		},
		license: {
			title: getSourceNestedString(
				'license',
				'title',
				typeof source.license === 'string' ? source.license : 'Unknown'
			),
			spdx: getSourceNestedString('license', 'spdx', ''),
			url: getSourceNestedString('license', 'url', ''),
		},
		samples: [],
		category: typeof source.category === 'string' ? source.category : '',
		palette: typeof source.palette === 'boolean' ? source.palette : false,
	};

	// Total as string
	if (typeof source.total === 'string') {
		const num = parseInt(source.total);
		if (num > 0) {
			result.total = num;
		}
	}

	// Add samples
	if (source.samples instanceof Array) {
		source.samples.forEach((item) => {
			if (result.samples.length < 3 && typeof item === 'string') {
				result.samples.push(item);
			}
		});
	}

	// Add height
	if (
		typeof source.height === 'number' ||
		typeof source.height === 'string'
	) {
		const num = parseInt(source.height as string);
		if (num > 0) {
			result.height = num;
		}
	}

	if (source.height instanceof Array) {
		source.height.forEach((item) => {
			const num = parseInt(item);
			if (num > 0) {
				if (!(result.height instanceof Array)) {
					result.height = [];
				}
				result.height.push(num);
			}
		});

		switch ((result.height as number[]).length) {
			case 0:
				delete result.height;
				break;

			case 1:
				result.height = (result.height as number[])[0];
		}
	}

	// Add display height
	if (typeof result.height === 'number') {
		// Convert from height
		result.displayHeight = result.height;
		while (result.displayHeight < minDisplayHeight) {
			result.displayHeight *= 2;
		}
		while (result.displayHeight > maxDisplayHeight) {
			result.displayHeight /= 2;
		}

		if (
			result.displayHeight !== Math.round(result.displayHeight) ||
			result.displayHeight < minDisplayHeight ||
			result.displayHeight > maxDisplayHeight
		) {
			delete result.displayHeight;
		}
	}

	if (
		typeof source.displayHeight === 'number' ||
		typeof source.displayHeight === 'string'
	) {
		// Convert from source.displayHeight
		const num = parseInt(source.displayHeight as string);
		if (
			num >= minDisplayHeight &&
			num <= maxDisplayHeight &&
			Math.round(num) === num
		) {
			result.displayHeight = num;
		}
	}

	// Convert palette from string value
	if (typeof source.palette === 'string') {
		switch (source.palette.toLowerCase()) {
			case 'colorless': // Iconify v1
			case 'false': // Boolean as string
				result.palette = false;
				break;

			case 'colorful': // Iconify v1
			case 'true': // Boolean as string
				result.palette = true;
		}
	}

	// Parse all old keys
	Object.keys(source).forEach((key) => {
		const value = source[key];
		if (typeof value !== 'string') {
			return;
		}
		switch (key) {
			case 'url':
			case 'uri':
				result.author.url = value;
				break;

			case 'licenseURL':
			case 'licenseURI':
				result.license.url = value;
				break;

			case 'licenseID':
			case 'licenseSPDX':
				result.license.spdx = value;
				break;
		}
	});

	return result;
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
	const tags: string[] =
		typeof source.categories === 'object' && source.categories !== null
			? Object.keys(source.categories)
			: [];
	const hasTags = tags.length > 0;

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
	tags.forEach((tag) => {
		const list = (source.categories as Record<string, string[]>)[tag];
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
					tags: [tag],
				};
				icons[name] = icon;
				return;
			}

			// Add tag to existing icon
			if (icons[name].tags === void 0) {
				icons[name].tags = [];
			}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			icons[name].tags!.push(tag);
		});
	});

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

	// Add characters and aliases
	if (typeof source.chars === 'object') {
		const chars = source.chars as Record<string, string>;
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

	// Add aliases
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
			}
		});
	}

	// Convert to sorted array
	const sortedIcons: Icon[] = [];
	Object.keys(icons)
		.sort((a, b) => a.localeCompare(b))
		.forEach((key) => {
			sortedIcons.push(icons[key]);
		});

	// Check tags
	if (tags.length > 1) {
		result.tags = tags;
	} else if (hasTags) {
		// Only one tag - delete tags
		sortedIcons.forEach((icon) => {
			delete icon.tags;
		});
	}

	// Add themes
	const themePrefixes: string[] = [],
		themeSuffixes: string[] = [];

	if (typeof source.themes === 'object' && source.themes !== null) {
		const themes = source.themes as IconifyThemes;
		Object.keys(themes).forEach((key) => {
			const theme = themes[key];

			// Find and validate all prefixes
			if (theme.prefix !== void 0) {
				let themePrefix = theme.prefix;
				if (themePrefix.slice(-1) !== '-') {
					themePrefix += '-';
				}
				const length = themePrefix.length;

				let found = false;
				sortedIcons.forEach((icon) => {
					if (icon.name.slice(0, length) === themePrefix) {
						icon.themePrefix = theme.title;
						found = true;
					}
				});

				if (found) {
					themePrefixes.push(theme.title);
				}
			}

			// Find and validate all suffixes
			if (theme.suffix !== void 0) {
				let themeSuffix = theme.suffix;
				if (themeSuffix.slice(0, 1) !== '-') {
					themeSuffix = '-' + themeSuffix;
				}
				const length = 0 - themeSuffix.length;

				let found = false;
				sortedIcons.forEach((icon) => {
					if (icon.name.slice(length) === themeSuffix) {
						icon.themeSuffix = theme.title;
						found = true;
					}
				});

				if (found) {
					themeSuffixes.push(theme.title);
				}
			}
		});

		// Check for icons without prefix and validate prefixes
		if (themePrefixes.length) {
			let missing = false;
			sortedIcons.forEach((icon) => {
				if (icon.themePrefix === void 0) {
					icon.themePrefix = '';
					missing = true;
				}
			});
			if (missing) {
				themePrefixes.push('');
			}

			// Add prefixes to result
			if (themePrefixes.length > 1) {
				result.themePrefixes = themePrefixes;
			} else {
				// All icons have same prefix - delete it
				sortedIcons.forEach((icon) => delete icon.themePrefix);
			}
		}

		// Same for suffixes
		if (themeSuffixes.length) {
			let missing = false;
			sortedIcons.forEach((icon) => {
				if (icon.themeSuffix === void 0) {
					icon.themeSuffix = '';
					missing = true;
				}
			});
			if (missing) {
				themeSuffixes.push('');
			}

			// Add suffixes to result
			if (themeSuffixes.length > 1) {
				result.themeSuffixes = themeSuffixes;
			} else {
				// All icons have same suffix - delete it
				sortedIcons.forEach((icon) => delete icon.themeSuffix);
			}
		}
	}

	// Add icons
	result.icons = sortedIcons;
	result.total = result.icons.length;

	return result;
}
