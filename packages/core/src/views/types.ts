import { CollectionsView, CollectionsViewBlocks } from './collections';
import { CollectionView, CollectionViewBlocks } from './collection';
import { SearchView, SearchViewBlocks } from './search';
import { CustomView, CustomViewBlocks } from './custom';
import { EmptyView, EmptyViewBlocks } from './empty';

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
