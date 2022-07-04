import type {
	IconFinderIconSetTheme,
	IconFinderIconSetThemeItem,
} from '../types/themes';
import { getBaseIconForTheme } from './base';

interface GetThemeVariationsResult {
	name: string;
	item: IconFinderIconSetThemeItem;
}

/**
 * Get all icon variations for theme, including item
 */
export function getThemeVariations(
	name: string | ReturnType<typeof getBaseIconForTheme>,
	theme: IconFinderIconSetTheme
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
		const item = filters[i];
		const match = item.match;
		results.push({
			name: type === 'prefixes' ? match + baseName : baseName + match,
			item,
		});
	}

	return results;
}
