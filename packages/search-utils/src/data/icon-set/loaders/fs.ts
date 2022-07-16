import { validateIconSet } from '@iconify/utils';
import { readFile } from 'node:fs/promises';
import { iconSetsStorage } from '../../storage/data/icon-set';
import { loadStorageItem } from '../../storage/functions';
import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from '../../storage/types/icon-set';
import type {
	IconFinderStorageError,
	IconFinderStorageLoader,
} from '../../storage/types/storage';
import { convertRawIconSet } from '../convert/raw';

/**
 * Load icon set
 */
async function loader(
	filename: string,
	params: StoredIconFinderIconSetParams
): Promise<StoredIconFinderIconSet | IconFinderStorageError> {
	// Read file
	let content: unknown;
	try {
		content = JSON.parse(await readFile(filename, 'utf8'));
	} catch {
		return 404;
	}

	// Validate and convert it
	const validatedContent = validateIconSet(content);
	const iconSet =
		validatedContent &&
		convertRawIconSet(params.provider, validatedContent);
	if (!iconSet || iconSet.id.prefix !== params.prefix) {
		return 503;
	}

	return iconSet;
}

/**
 * Get loader
 */
export function getIconSetFSLoader(
	filename: string
): IconFinderStorageLoader<
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams
> {
	return loader.bind(null, filename);
}

/**
 * Load icon set from file system
 */
export function loadIconSetFromFS(
	provider: string,
	prefix: string,
	filename: string
) {
	return loadStorageItem(iconSetsStorage, getIconSetFSLoader(filename), {
		provider,
		prefix,
	});
}
