import { BaseBlock } from './types';

/**
 * Interface for block
 */
export interface CollectionsFilterBlock extends BaseBlock {
	readonly type: 'collections-filter';
	keyword: string;
}

/**
 * Default block values
 */
export const defaultCollectionsFilterBlock = (): CollectionsFilterBlock => {
	return {
		type: 'collections-filter',
		keyword: '',
	};
};

/**
 * Check if block is empty
 */
export function isCollectionsFilterBlockEmpty(
	block?: CollectionsFilterBlock | null
): boolean {
	return block === void 0 || block === null || block.keyword.trim() === '';
}
