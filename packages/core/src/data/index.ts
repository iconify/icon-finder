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
		this._merge(values);
	}

	/**
	 * Get customised values
	 */
	customised(): DataStorage {
		const customised: DataStorage = {};

		Object.keys(this.data).forEach(key => {
			if (this._default[key] === void 0) {
				// New key
				customised[key] = JSON.parse(JSON.stringify(this.data[key]));
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
					!this._compare(defaults[key2], custom[key2])
				) {
					found = true;
					child[key2] = JSON.parse(JSON.stringify(custom[key2]));
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
	_merge(data: DataStorage): void {
		Object.keys(data).forEach(key => {
			if (this.data[key] === void 0) {
				// Adding new root object
				this.data[key] = JSON.parse(JSON.stringify(data[key]));
				return;
			}

			// Merge objects
			const clone = JSON.parse(JSON.stringify(data[key]));
			Object.assign(this.data[key], clone);
		});
	}

	/**
	 * Compare 2 values
	 */
	_compare(item1: unknown, item2: unknown): boolean {
		if (typeof item1 !== typeof item2) {
			return false;
		}

		switch (typeof item1) {
			case 'object':
				if (item2 === null) {
					item1 = null;
				}
				return JSON.stringify(item1) === JSON.stringify(item2);

			default:
				return item1 === item2;
		}
	}
}
