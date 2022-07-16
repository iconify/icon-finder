import type { IconifyInfo } from '@iconify/types';
import { readFile } from 'node:fs/promises';
import { collectionsStorage } from '../../storage/data/collections';
import { loadStorageItem } from '../../storage/functions';
import type {
	StoredIconFinderCollectionsList,
	StoredIconFinderCollectionsParams,
} from '../../storage/types/collections';
import type {
	IconFinderStorageError,
	IconFinderStorageLoader,
} from '../../storage/types/storage';
import { convertCollectionsList } from '../convert/list';

/**
 * Load icon sets list
 */
async function loader(
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
export function getCollectionsFSLoader(
	filename: string
): IconFinderStorageLoader<
	StoredIconFinderCollectionsList,
	StoredIconFinderCollectionsParams
> {
	return loader.bind(null, filename);
}

/**
 * Load icon sets list from file system
 */
export function loadCollectionsFromFS(provider: string, filename: string) {
	return loadStorageItem(
		collectionsStorage,
		getCollectionsFSLoader(filename),
		provider
	);
}
