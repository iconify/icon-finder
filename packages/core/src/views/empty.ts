import { BaseView, BaseViewBlocks } from './base';
import { EmptyRoute } from '../route/types';
import { View } from './types';

/**
 * Blocks
 */
export type EmptyViewBlocks = BaseViewBlocks;

/**
 * Class
 */
export class EmptyView extends BaseView {
	public readonly route: EmptyRoute;

	/**
	 * Create view
	 */
	constructor(
		instance: string,
		route: EmptyRoute,
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
	_startLoading(): void {
		this._startedLoading = true;

		// Complete on next tick
		setTimeout(() => {
			this.loading = false;
			this._triggerLoaded();
		});
	}

	/**
	 * Run action on view
	 */
	action(action: string, value: unknown): void {
		if (action === 'parent') {
			this._parentAction(value);
		}
	}

	/**
	 * Render blocks
	 */
	render(): EmptyViewBlocks {
		return {};
	}
}
