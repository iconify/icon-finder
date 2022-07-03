import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeItem,
} from '../types/themes';

/**
 * Get base icon name, without prefix/suffix
 */
interface GetBaseIconForThemeResult {
	name: string;
	item: IconFinderIconSetThemeItem;
}
export function getBaseIconForTheme(
	name: string,
	theme: IconFinderIconSetTheme
): GetBaseIconForThemeResult | undefined {
	const { type, sorted } = theme;
	for (let i = 0; i < sorted.length; i++) {
		const item = sorted[i];
		const match = item.match;
		if (type === 'prefixes') {
			if (name.slice(0, match.length) === match) {
				// Found match
				return {
					name: name.slice(match.length),
					item,
				};
			}
		} else {
			if (name.slice(0 - match.length) === match) {
				return {
					name: name.slice(0, name.length - match.length),
					item,
				};
			}
		}
	}

	// No match
	return (
		theme.empty && {
			name,
			item: theme.empty,
		}
	);
}
