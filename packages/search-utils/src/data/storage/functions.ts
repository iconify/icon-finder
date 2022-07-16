import {
	fireIconFinderEvent,
	subscribeIconFinderEvent,
	unsubscribeIconFinderEvent,
} from '../../events/events';
import type {
	IconFinderStorage,
	IconFinderStorageError,
	IconFinderStorageItem,
	IconFinderStorageLoader,
} from './types/storage';

// Counter for events
let eventCounter = 0;

/**
 * Create new item
 */
function newStorageItem<T, P>(
	storage: IconFinderStorage<T, P>,
	key: string
): IconFinderStorageItem<T> {
	const item: IconFinderStorageItem<T> = {
		event: storage.eventPrefix + key,
	};
	storage.storage.set(key, item);
	return item;
}

/**
 * Get item from storage, async
 */
export function awaitItemFromStorage<T, P>(
	storage: IconFinderStorage<T, P>,
	key: string
): Promise<IconFinderStorageItem<T>> {
	return new Promise((fulfill) => {
		const item = storage.storage.get(key) || newStorageItem(storage, key);

		// Got it
		if (item.data || item.error) {
			fulfill(item);
		} else {
			// Wait for event
			const key = 'await-storage-' + (eventCounter++).toString();
			subscribeIconFinderEvent(
				item.event,
				() => {
					unsubscribeIconFinderEvent(item.event, key);
					fulfill(item);
				},
				key
			);
		}
	});
}

/**
 * Get error
 */
function getLoaderError(error: number): IconFinderStorageError {
	if (error === 404) {
		return error;
	}
	return 503;
}

/**
 * Start loading
 */
export function startLoadingStorageItem<T, P>(
	storage: IconFinderStorage<T, P>,
	loader: IconFinderStorageLoader<T, P>,
	params: P,
	key: string
): IconFinderStorageItem<T> {
	let item = storage.storage.get(key);
	if (!item) {
		const newItem = (item = newStorageItem(storage, key));

		// Start loading on next tick
		setTimeout(() => {
			loader(params)
				.then((data) => {
					if (typeof data === 'number') {
						newItem.error = getLoaderError(data);
					} else {
						newItem.data = data;
					}
					fireIconFinderEvent(newItem.event, item);
				})
				.catch(() => {
					newItem.error = 503;
					fireIconFinderEvent(newItem.event, item);
				});
		});
	}

	return item;
}

/**
 * Wait for item to load
 */
export function loadStorageItem<T, P>(
	storage: IconFinderStorage<T, P>,
	loader: IconFinderStorageLoader<T, P>,
	params: P,
	key?: string
): Promise<IconFinderStorageItem<T>> {
	// Get key
	key = key || storage.key(params);

	// Start loading item
	startLoadingStorageItem(storage, loader, params, key);

	// Await data
	return awaitItemFromStorage(storage, key);
}
