import type { IconFinderThemeFilter } from '../../filters/types/filter';
import type { IconFinderThemeFiltersList } from '../../filters/types/list';

/**
 * Get base icon name, without prefix/suffix
 */
interface GetBaseIconForThemeResult {
	name: string;
	filter: IconFinderThemeFilter;
}
export function getBaseIconForTheme(
	name: string,
	theme: IconFinderThemeFiltersList
): GetBaseIconForThemeResult | undefined {
	const { type, sorted } = theme;
	for (let i = 0; i < sorted.length; i++) {
		const filter = sorted[i];
		const match = filter.match;
		if (type === 'prefixes') {
			if (name.slice(0, match.length) === match) {
				// Found match
				return {
					name: name.slice(match.length),
					filter,
				};
			}
		} else {
			if (name.slice(0 - match.length) === match) {
				return {
					name: name.slice(0, name.length - match.length),
					filter,
				};
			}
		}
	}

	// No match
	return (
		theme.empty && {
			name,
			filter: theme.empty,
		}
	);
}
