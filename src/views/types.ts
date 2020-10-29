import type { CollectionsView, CollectionsViewBlocks } from './collections';
import type { CollectionView, CollectionViewBlocks } from './collection';
import type { SearchView, SearchViewBlocks } from './search';
import type { CustomView, CustomViewBlocks } from './custom';
import type { EmptyView, EmptyViewBlocks } from './empty';

export type View =
	| CollectionsView
	| CollectionView
	| SearchView
	| CustomView
	| EmptyView;
export type ViewBlocks =
	| CollectionsViewBlocks
	| CollectionViewBlocks
	| SearchViewBlocks
	| CustomViewBlocks
	| EmptyViewBlocks;
