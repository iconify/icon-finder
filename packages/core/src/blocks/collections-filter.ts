/**
 * Interface for block
 */
export interface CollectionsFilterBlock {
	keyword: string;
}

/**
 * Default block values
 */
export const defaultCollectionsFilterBlock = (): CollectionsFilterBlock => {
	return {
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
