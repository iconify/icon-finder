import { _api } from 'iconify-icon';
import type { APIv2CollectionsResponse } from '../../api-types/v2';
import { collectionsStorage } from '../storage';
import { getLoaderError, loadStorageItem } from '../../storage/functions';
import type { StoredIconFinderCollectionsList } from '../types/storage';
import type {
	IconFinderStorageError,
	IconFinderStorageItem,
} from '../../storage/types/storage';
import { convertCollectionsList } from '../convert/list';

/**
 * Load icon sets list
 */
export function collectionsAPIv2Loader(
	provider: string
): Promise<StoredIconFinderCollectionsList | IconFinderStorageError> {
	return new Promise((fulfill) => {
		_api.sendAPIQuery(
			provider,
			{
				type: 'custom',
				provider,
				uri: '/collections?hidden=true',
			},
			(data, error) => {
				if (error) {
					// Failed
					fulfill(getLoaderError(error));
					return;
				}

				// Success
				fulfill(
					convertCollectionsList(data as APIv2CollectionsResponse) ||
						503
				);
			}
		);
	});
}

/**
 * Load icon sets list from API
 */
// export function loadCollectionsFromAPIv2(provider: string) {
// 	return loadStorageItem(collectionsStorage, collectionsAPIv2Loader, provider);
// }

/**
 * Wait for collections list to load before parsing another API query
 */
export function waitForCollectionsFromAPIv2(
	provider: string,
	successCallback: (
		data: unknown,
		collections: StoredIconFinderCollectionsList
	) => void,
	failCallback: (error: IconFinderStorageError) => void
): (data: unknown, error: unknown) => void {
	// Track if `done` was called
	let completed: true | undefined;

	// Status of collections
	let collectionsLoaded:
		| undefined
		| IconFinderStorageItem<StoredIconFinderCollectionsList>;

	// Status of custom data
	interface Data {
		data: unknown;
		error: unknown;
	}
	let dataLoaded: Data | undefined;

	// Check status
	const check = () => {
		if (collectionsLoaded && dataLoaded && !completed) {
			// Got both parts of data
			completed = true;

			const dataError = dataLoaded.error;
			const collections = collectionsLoaded.data;
			const collectionsError = collectionsLoaded.error;

			if (!collections || dataError || collectionsError) {
				failCallback(getLoaderError(collectionsError || dataError));
			} else {
				successCallback(dataLoaded.data, collections);
			}
		}
	};

	// Load collections
	loadStorageItem(collectionsStorage, collectionsAPIv2Loader, provider)
		.then((data) => {
			collectionsLoaded = data;
			check();
		})
		.catch(() => {
			if (!collectionsLoaded) {
				collectionsLoaded = {
					error: 503,
					event: '',
				};
				check();
			}
		});

	// Return callback for API query
	return (data, error) => {
		// Got data: check status
		dataLoaded = {
			data,
			error,
		};
		check();
	};
}
