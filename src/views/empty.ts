import type { BaseViewBlocks } from './base';
import { BaseView } from './base';
import type { FullEmptyRoute } from '../route/types/routes';
import type { View } from './types';

/**
 * Blocks
 */
export type EmptyViewBlocks = BaseViewBlocks;

/**
 * Class
 */
export class EmptyView extends BaseView {
	public readonly route: FullEmptyRoute;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: FullEmptyRoute,
		parent: View | null = null
	) {
		super();
		this.type = 'empty';
		this._instance = instance;
		this.route = route;
		this.parent = parent;
	}

	/**
	 * Start loading
	 */
	_startLoadingData(): void {
		this.loading = false;
		this._triggerLoaded();
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		switch (action) {
			// Navigate to parent view
			case 'parent':
				this._parentAction(value);
				return;

			// Change provider
			case 'provider':
				this._providerAction(value);
				return;
		}
	}

	/**
	 * Render blocks
	 */
	render(): EmptyViewBlocks {
		return {};
	}
}
