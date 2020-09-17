import { CollectionInfo } from '../converters/collection';

/**
 * Collection info storage for prefix
 */
type CollectionInfoList = Record<string, CollectionInfo>;

/**
 * Collection info storage for providers
 */
export type CollectionsInfoStorage = Record<string, CollectionInfoList>;

/**
 * Set data
 */
export function setCollectionInfo(
	storage: CollectionsInfoStorage,
	provider: string,
	prefix: string,
	data: CollectionInfo
): void {
	if (storage[provider] === void 0) {
		storage[provider] = Object.create(null);
	}
	const providerData = storage[provider];
	if (providerData[prefix] === void 0 || data.index) {
		// Overwrite previous entry only if index is set
		providerData[prefix] = data;
	}
}

/**
 * Get data
 */
export function getCollectionInfo(
	storage: CollectionsInfoStorage,
	provider: string,
	prefix: string
): CollectionInfo | null {
	return storage[provider] !== void 0 && storage[provider][prefix] === void 0
		? null
		: storage[provider][prefix];
}

/**
 * Get collection title (or prefix if not available)
 */
export function getCollectionTitle(
	storage: CollectionsInfoStorage,
	provider: string,
	prefix: string
): string {
	if (storage[provider] === void 0 || storage[provider][prefix] === void 0) {
		return prefix;
	}
	return storage[provider][prefix].name;
}
