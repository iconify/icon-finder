import {
	CollectionInfoBlock,
	isCollectionInfoBlockEmpty,
} from './collection-info';
import {
	CollectionsFilterBlock,
	isCollectionsFilterBlockEmpty,
} from './collections-filter';
import {
	CollectionsListBlock,
	isCollectionsBlockEmpty,
} from './collections-list';
import { FiltersBlock, isFiltersBlockEmpty } from './filters';
import { IconsListBlock, isIconsListBlockEmpty } from './icons-list';
import { PaginationBlock, isPaginationEmpty } from './pagination';
import { SearchBlock, isSearchBlockEmpty } from './search';

/**
 * Block types
 */
export type BlockType =
	| 'collection-info'
	| 'collections-filter'
	| 'collections-list'
	| 'filters'
	| 'icons-list'
	| 'pagination'
	| 'search';

/**
 * Base block type
 */
export interface BaseBlock {
	readonly type: BlockType;
}

/**
 * Union type for all blocks
 */
export type Block =
	| CollectionInfoBlock
	| CollectionsFilterBlock
	| CollectionsListBlock
	| FiltersBlock
	| IconsListBlock
	| PaginationBlock
	| SearchBlock;

/**
 * TypeScript guard
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unused-vars-experimental, @typescript-eslint/no-empty-function
function assertNever(s: never): void {}

/**
 * Check if block is empty
 */
export function isBlockEmpty(block?: Block | null): boolean {
	if (block === void 0 || block === null) {
		return true;
	}
	const type = block.type;
	switch (type) {
		case 'collection-info':
			return isCollectionInfoBlockEmpty(block as CollectionInfoBlock);

		case 'collections-filter':
			return isCollectionsFilterBlockEmpty(
				block as CollectionsFilterBlock
			);

		case 'collections-list':
			return isCollectionsBlockEmpty(block as CollectionsListBlock);

		case 'filters':
			return isFiltersBlockEmpty(block as FiltersBlock);

		case 'icons-list':
			return isIconsListBlockEmpty(block as IconsListBlock);

		case 'pagination':
			return isPaginationEmpty(block as PaginationBlock);

		case 'search':
			return isSearchBlockEmpty(block as SearchBlock);

		default:
			assertNever(type);
			return true;
	}
}
