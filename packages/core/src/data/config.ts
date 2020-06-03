import { Data, DataStorage } from '../data';

/**
 * Default configuration.
 *
 * 2 levels deep object:
 * object[key][key2] = value
 */
const defaultConfig: DataStorage = {
	// Display
	display: {
		// Number of icons per page.
		itemsPerPage: 52,

		// Maximum delay between changing current view and updating visible view.
		// This delay is used to avoid "loading" page when changing views.
		viewUpdateDelay: 300,

		// Number of sibling collections to show when collection view is child view of collections list.
		showSiblingCollections: 2,
	},

	// Router
	router: {
		// Home route as string
		home: JSON.stringify({
			type: 'collections',
		}),
	},
};

/**
 * Config class
 */
export class Config extends Data {
	/**
	 * Set default value
	 */
	_setDefault(): void {
		this._default = defaultConfig;
	}
}
