import { CollectionsView, CollectionsViewBlocks } from './collections';
import { CollectionView, CollectionViewBlocks } from './collection';
import { SearchView, SearchViewBlocks } from './search';
import { CustomView, CustomViewBlocks } from './custom';

export type View = CollectionsView | CollectionView | SearchView | CustomView;
export type ViewBlocks =
	| CollectionsViewBlocks
	| CollectionViewBlocks
	| SearchViewBlocks
	| CustomViewBlocks;
