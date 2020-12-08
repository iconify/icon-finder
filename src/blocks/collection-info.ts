import type { BaseBlock } from './types';
import type { CollectionInfo } from '../converters/info';

/**
 * Interface for block
 */
export interface CollectionInfoBlock extends BaseBlock {
	readonly type: 'collection-info';
	prefix: string;
	info: CollectionInfo | null;
}

/**
 * Default block values
 */
export const defaultCollectionInfoBlock = (): CollectionInfoBlock => {
	return {
		type: 'collection-info',
		prefix: '',
		info: null,
	};
};

/**
 * Check if block is empty
 */
export function isCollectionInfoBlockEmpty(
	block?: CollectionInfoBlock | null
): boolean {
	return block === void 0 || block === null || block.info === null;
}
