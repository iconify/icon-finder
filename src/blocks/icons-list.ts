import type { BaseBlock } from './types';
import type { Icon } from '../misc/icon';
import type { SearchBlock } from './search';
import type { FiltersBlock } from './filters';
import { enableFilters } from './filters';
import type { CollectionViewBlocksIconFilters } from '../views/collection';

/**
 * Interface for block
 */
export interface IconsListBlock extends BaseBlock {
	readonly type: 'icons-list';
	icons: Icon[];
}

/**
 * Default block values
 */
export const defaultIconsListBlock = (): IconsListBlock => {
	return {
		type: 'icons-list',
		icons: [],
	};
};

/**
 * Check if block is empty
 */
export function isIconsListBlockEmpty(block?: IconsListBlock | null): boolean {
	return block === void 0 || block === null || block.icons.length < 1;
}

/**
 * Icon attributes to search
 */
const searchableIconAttributes: (keyof Icon)[] = ['name', 'chars', 'aliases'];

const searchableIconAttributesWithPrefixes: (keyof Icon)[] = [
	'prefix',
	'name',
	'chars',
	'aliases',
];

/**
 * Apply filters to icons list
 */
export function applyIconFilters(
	block: IconsListBlock,
	search: SearchBlock,
	filters: FiltersBlock[] = [],
	searchPrefixes = false
): IconsListBlock {
	let icons = block.icons.slice(0);

	const searchableAttributes = searchPrefixes
		? searchableIconAttributesWithPrefixes
		: searchableIconAttributes;

	// Get Icon attribute matching filter (legacy from when attributes didn't match, but kept in case things change again)
	function iconAttr(
		key: keyof CollectionViewBlocksIconFilters
	): keyof Icon | null {
		return key;
	}

	// Search
	const keyword = search ? search.keyword.trim() : '';
	if (keyword !== '') {
		// Find all icons that match keyword
		const keywords: string[] = keyword
			.toLowerCase()
			.split(/[\s:]/)
			.map((keyword) => keyword.trim())
			.filter((keyword) => keyword.length > 0);

		if (keywords.length) {
			const searches = searchableAttributes.slice(0);

			keywords.forEach((keyword) => {
				let exclude = false;
				if (keyword.slice(0, 1) === '-') {
					exclude = true;
					keyword = keyword.slice(1);
					if (!keyword.length) {
						return;
					}
				}

				icons = icons.filter((item) => {
					const icon = item as Icon;
					let match = false;

					searches.forEach((attr) => {
						if (match || icon[attr] === void 0) {
							return;
						}
						if (typeof icon[attr] === 'string') {
							match =
								(icon[attr] as string).indexOf(keyword) !== -1;
							return;
						}
						if (icon[attr] instanceof Array) {
							(icon[attr] as string[]).forEach((value) => {
								match = match || value.indexOf(keyword) !== -1;
							});
						}
					});
					return exclude ? !match : match;
				});
			});
		}
	}

	// Toggle filter visibility
	const isSearched = icons.length !== block.icons.length;
	filters.forEach((filter) => {
		enableFilters(filter, true);
		if (!isSearched) {
			return;
		}

		const attr = iconAttr(
			filter.filterType as keyof CollectionViewBlocksIconFilters
		);
		if (attr === null) {
			return;
		}

		Object.keys(filter.filters).forEach((match) => {
			for (let i = icons.length - 1; i >= 0; i--) {
				const value = (icons[i] as Icon)[attr];

				if (value === void 0 || value === null) {
					continue;
				}

				if (typeof value === 'string') {
					if (value === match) {
						return;
					}
					continue;
				}
				if (value instanceof Array && value.indexOf(match) !== -1) {
					return;
				}
			}

			// No matches
			filter.filters[match].disabled = true;
		});
	});

	// Apply filters
	filters.forEach((filter) => {
		if (filter.active === null) {
			return;
		}

		const match = filter.active;
		const attr = iconAttr(
			filter.filterType as keyof CollectionViewBlocksIconFilters
		);
		if (attr === null) {
			return;
		}

		icons = icons.filter((icon) => {
			const value = (icon as Icon)[attr];

			if (value === void 0 || value === null) {
				return false;
			}
			if (typeof value === 'string') {
				return value === match;
			}
			if (value instanceof Array) {
				return value.indexOf(match) !== -1;
			}
			return false;
		});
	});

	block.icons = icons;
	return block;
}
