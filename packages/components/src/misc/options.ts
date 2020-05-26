import { Data, DataStorage, DataChildStorage } from '@iconify/search-core';

export { DataStorage, DataChildStorage };

const defaultOptions: DataStorage = {
	layout: {
		// Icons list mode.
		list: false,
		// True if icons list mode can be changed.
		toggleList: true,
	},
	links: {
		collection: 'https://iconify.design/icon-sets/{prefix}/',
		icon: 'https://iconify.design/icon-sets/{prefix}/{name}.html',
	},
};

/**
 * Options class
 */
export class Options extends Data {
	constructor(
		customOptions?: DataStorage,
		defaultOptionsChanges?: DataStorage
	) {
		super();

		this._default = Object.assign(
			{},
			defaultOptions,
			defaultOptionsChanges === void 0 ? {} : defaultOptionsChanges
		);

		this._merge(this._default);
		if (customOptions !== void 0) {
			this._merge(customOptions, false);
		}
	}
}
