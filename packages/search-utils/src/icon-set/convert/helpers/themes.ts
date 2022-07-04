import type { IconifyJSON } from 'iconify-icon';
import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeItem,
	IconFinderIconSetThemeTypes,
} from '../../types/themes';

/**
 * Convert theme
 */
function convert(
	data: Record<string, string>,
	prefix: boolean,
	index: number
): IconFinderIconSetTheme {
	const filters = [] as IconFinderIconSetTheme['filters'];
	const result: IconFinderIconSetTheme = {
		type: prefix ? 'prefixes' : 'suffixes',
		filters,
		sorted: [],
	};

	const list = Object.create(null) as Record<
		string,
		IconFinderIconSetThemeItem
	>;

	// Parse all items
	for (const key in data) {
		const isEmpty = !key;
		const match = isEmpty ? '' : prefix ? key + '-' : '-' + key;
		const item: IconFinderIconSetThemeItem = {
			title: data[key],
			match,
			color: index++,
		};
		result.filters.push(item);

		if (!key) {
			result.empty = item;
		} else {
			list[key] = item;
		}
	}

	// Add sorted keys
	const sortedKeys = Object.keys(data).sort((a, b) =>
		a.length === b.length ? a.localeCompare(b) : b.length - a.length
	);
	result.sorted = sortedKeys.filter((key) => !!key).map((key) => list[key]);

	return result;
}

// Result of getIconSetThemes()
type GetIconSetThemesResult = Partial<
	Record<IconFinderIconSetThemeTypes, IconFinderIconSetTheme>
>;

/**
 * Convert icon set themes
 */
export function getIconSetThemes(data: IconifyJSON): GetIconSetThemesResult {
	const rawPrefixes =
		data.prefixes || (Object.create(null) as Record<string, string>);
	const rawSuffixes =
		data.suffixes || (Object.create(null) as Record<string, string>);

	if (data.themes) {
		// Import legacy format
		for (const key in data.themes) {
			const item = data.themes[key];
			if (typeof item.prefix === 'string' && !data.prefixes) {
				// Prefix ending with with '-'
				const prefix = item.prefix;
				if (prefix.slice(-1) === '-') {
					rawPrefixes[prefix.slice(0, -1)] = item.title;
				}
			}
			if (typeof item.suffix === 'string' && !data.suffixes) {
				// Suffix starting with with '-'
				const suffix = item.suffix;
				if (suffix.slice(0, 1) === '-') {
					rawSuffixes[suffix.slice(1)] = item.title;
				}
			}
		}
	}

	// Convert prefixes and suffixes
	const result = {} as GetIconSetThemesResult;
	if (Object.keys(rawPrefixes).length > 1) {
		result.prefixes = convert(rawPrefixes, true, 0);
	}
	if (Object.keys(rawSuffixes).length > 1) {
		result.suffixes = convert(
			rawSuffixes,
			false,
			result.prefixes ? result.prefixes.filters.length : 0
		);
	}

	return result;
}
