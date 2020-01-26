import { clone, compare } from '../objects';

export interface DataChildStorage {
	[key: string]: unknown;
}

export interface DataStorage {
	[key: string]: DataChildStorage;
}

/**
 * Config class
 */
export class Data {
	public data: DataStorage;
	protected _default: DataStorage = {};

	constructor() {
		this.data = {};
		this._setDefault();
		this._merge(this._default);
	}

	/**
	 * Set default value
	 */
	_setDefault(): void {
		this._default = {};
	}

	/**
	 * Merge with custom data
	 */
	set(values: DataStorage): void {
		this._merge(values, false);
	}

	/**
	 * Get customised values
	 */
	customised(): DataStorage {
		const customised: DataStorage = {};

		Object.keys(this.data).forEach(key => {
			if (this._default[key] === void 0) {
				// New key
				customised[key] = clone(this.data[key]) as DataChildStorage;
				return;
			}

			// Check all keys
			const defaults = this._default[key],
				custom = this.data[key];

			const child: DataChildStorage = {};
			let found = false;

			Object.keys(custom).forEach(key2 => {
				if (
					defaults[key2] === void 0 ||
					!compare(defaults[key2], custom[key2])
				) {
					found = true;
					child[key2] = clone(custom[key2]);
				}
			});

			if (found) {
				customised[key] = child;
			}
		});

		return customised;
	}

	/**
	 * Merge data
	 */
	_merge(data: DataStorage, allowCustom = true): void {
		Object.keys(data).forEach(key => {
			if (this.data[key] === void 0) {
				// Adding new root object
				if (allowCustom) {
					this.data[key] = clone(data[key]) as DataChildStorage;
				}
				return;
			}

			// Merge objects
			Object.keys(data[key]).forEach(key2 => {
				if (this.data[key][key2] !== void 0 || allowCustom) {
					// Overwrite entry
					this.data[key][key2] = clone(data[key][key2]);
				}
			});
		});
	}
}
