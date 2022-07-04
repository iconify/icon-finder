import type { IconFinderThemeFilter } from '../../filters/types/filter';
import type { IconFinderThemeFiltersList } from '../../filters/types/list';
import { getBaseIconForTheme } from './base';

interface GetThemeVariationsResult {
	name: string;
	filter: IconFinderThemeFilter;
}

/**
 * Get all icon variations for theme, including item
 */
export function getThemeVariations(
	name: string | ReturnType<typeof getBaseIconForTheme>,
	theme: IconFinderThemeFiltersList
): GetThemeVariationsResult[] | undefined {
	const baseItem =
		typeof name === 'string' ? getBaseIconForTheme(name, theme) : name;
	if (!baseItem) {
		// No matching theme
		return;
	}

	const baseName = baseItem.name;
	const { type, filters } = theme;
	const results: GetThemeVariationsResult[] = [];
	for (let i = 0; i < filters.length; i++) {
		const filter = filters[i];
		const match = filter.match;
		results.push({
			name: type === 'prefixes' ? match + baseName : baseName + match,
			filter,
		});
	}

	return results;
}
