import type { Icon } from '../misc/icon';
import type { BaseBlock } from './types';

export interface IconsNavBlock extends BaseBlock {
	readonly type: 'icons-nav';

	// First icon.
	first: Icon;

	// Last icon.
	last: Icon;

	// Reference icon.
	reference: Icon;

	// Previous icon. Does not exist if reference icon is the first icon.
	prev?: Icon;

	// Next icon. Does not exist if reference icon is the last icon.
	next?: Icon;
}
