import { BaseBlock } from './types';

/**
 * Interface for block
 */
export interface SearchBlock extends BaseBlock {
	readonly type: 'search';

	keyword: string;

	// Optional type and title, used for placeholder and button
	searchType?: 'all' | 'collection' | 'custom';

	// Title is customType for custom view, collection name or prefix for collection
	title?: string;
}

/**
 * Default block values
 */
export const defaultSearchBlock = (): SearchBlock => {
	return {
		type: 'search',
		keyword: '',
	};
};

/**
 * Check if block is empty
 */
export function isSearchBlockEmpty(block?: SearchBlock | null): boolean {
	return block === void 0 || block === null || block.keyword.trim() === '';
}
