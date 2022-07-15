import {
	fireIconFinderEvent,
	subscribeIconFinderEvent,
} from '../../events/events';
import type { IconFinderCollectionsList } from './types/collections';
import type { StoredIconFinderCollectionsList } from './types/storage';

// Internal event
const eventName = 'collections-storage-';

/**
 * Storage
 */
type StorageByProvider = Record<string, StoredIconFinderCollectionsList>;
const storage = Object.create(null) as StorageByProvider;

/**
 * Store collections list
 */
export function storeCollectionsList(
	provider: string,
	list: IconFinderCollectionsList
) {
	fireIconFinderEvent(
		eventName + provider,
		(storage[provider] = list.prefixed)
	);
}

/**
 * Get collections list
 */
export function getCollectionsList(
	provider: string
): StoredIconFinderCollectionsList | undefined {
	return storage[provider];
}

/**
 * Get collections list, asynchronous
 */
export function awaitCollectionsList(
	provider: string
): Promise<StoredIconFinderCollectionsList> {
	return new Promise((fulfill) => {
		if (storage[provider]) {
			fulfill(storage[provider]);
			return;
		}

		subscribeIconFinderEvent(eventName + provider, (data) => {
			fulfill(data as StoredIconFinderCollectionsList);
		});
	});
}
