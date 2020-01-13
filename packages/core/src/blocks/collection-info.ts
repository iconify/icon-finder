import { CollectionInfo } from '../converters/collection';

/**
 * Interface for block
 */
export interface CollectionInfoBlock {
	prefix: string;
	info: CollectionInfo | null;
}

/**
 * Default block values
 */
export const defaultCollectionInfoBlock = (): CollectionInfoBlock => {
	return {
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
