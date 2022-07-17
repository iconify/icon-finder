import type { IconifyInfo } from '@iconify/types';
import { readFile } from 'node:fs/promises';
import type { StoredIconFinderCollectionsList } from '../types/storage';
import type { IconFinderStorageError } from '../../storage/types/storage';
import { convertCollectionsList } from '../convert/list';

/**
 * Load icon sets list
 */
export async function collectionsFSLoader(
	filename: string
): Promise<StoredIconFinderCollectionsList | IconFinderStorageError> {
	// Read file
	let content: unknown;
	try {
		content = JSON.parse(await readFile(filename, 'utf8'));
	} catch {
		return 404;
	}

	// Convert it
	const list =
		typeof content === 'object' &&
		convertCollectionsList(content as Record<string, IconifyInfo>);
	if (!list || !list.total) {
		return 503;
	}

	return list;
}

/**
 * Get loader
 */
// export function getCollectionsFSLoader(
// 	filename: string
// ): IconFinderStorageLoader<
// 	StoredIconFinderCollectionsList,
// 	StoredIconFinderCollectionsParams
// > {
// 	return collectionsFSLoader.bind(null, filename);
// }

/**
 * Load icon sets list from file system
 */
// export function loadCollectionsFromFS(provider: string, filename: string) {
// 	return loadStorageItem(
// 		collectionsStorage,
// 		getCollectionsFSLoader(filename),
// 		provider
// 	);
// }
