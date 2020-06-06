import { cloneObject, compareObjects } from '../objects';

/**
 * Common functions for storing 2 level deep objects: configuration
 */

export interface DataChildStorage {
	[key: string]: unknown;
}

export interface DataStorage {
	[key: string]: DataChildStorage;
}

/**
 * Merge data
 */
function mergeData(
	storage: DataStorage,
	data: DataStorage,
	allowCustom = true
): void {
	Object.keys(data).forEach((key) => {
		if (storage[key] === void 0) {
			// Adding new root object
			if (allowCustom) {
				storage[key] = cloneObject(data[key]) as DataChildStorage;
			}
			return;
		}

		// Merge objects
		Object.keys(data[key]).forEach((key2) => {
			if (storage[key][key2] !== void 0 || allowCustom) {
				// Overwrite entry
				storage[key][key2] = cloneObject(data[key][key2]);
			}
		});
	});
}

/**
 * Set data to storage
 */
export function setData(storage: DataStorage, values: DataStorage): void {
	mergeData(storage, values, false);
}

/**
 * Get customised values
 */
export function customisedData(
	storage: DataStorage,
	defaultData: DataStorage
): DataStorage {
	const customised: DataStorage = {};

	Object.keys(storage).forEach((key) => {
		// Check all keys
		const defaults = defaultData[key] === void 0 ? {} : defaultData[key];
		const custom = storage[key];

		const child: DataChildStorage = {};
		let found = false;

		Object.keys(custom).forEach((key2) => {
			if (
				// Ignore functions
				typeof custom[key2] !== 'function' &&
				// Copy if value is missing or different
				(defaults[key2] === void 0 ||
					!compareObjects(defaults[key2], custom[key2]))
			) {
				found = true;
				child[key2] = cloneObject(custom[key2]);
			}
		});

		if (found) {
			customised[key] = child;
		}
	});

	return customised;
}
