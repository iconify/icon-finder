import type { IconFinderFilter } from '../../filters/types/filter';
import type { IconFinderIconSet } from '../types/icon-set';

/**
 * Get filters that can be toggled
 */
export function getIconSetIconClickableFilters(
	iconSet: IconFinderIconSet,
	name: string,
	tagsOnly = false
): IconFinderFilter[] {
	const icon = iconSet.icons.iconsMap.get(name);
	if (!icon) {
		return [];
	}

	const { prefixes, suffixes, tags } = iconSet.filters;

	// Add tags
	const iconTags = icon.tags;
	const result: IconFinderFilter[] = iconTags
		? iconTags
				.filter((tag) => tags?.selected !== tag)
				.sort((a, b) => a.title.localeCompare(b.title))
		: [];

	// Add prefix and suffix before tags
	if (!tagsOnly) {
		const iconSuffix = icon.suffix;
		if (suffixes && iconSuffix && suffixes.selected !== iconSuffix) {
			result.unshift(iconSuffix);
		}

		const iconPrefix = icon.prefix;
		if (prefixes && iconPrefix && prefixes.selected !== iconPrefix) {
			result.unshift(iconPrefix);
		}
	}

	return result;
}
