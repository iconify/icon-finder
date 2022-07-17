import { _api } from 'iconify-icon';
import type { APIv2CollectionResponse } from '../../../api/types/v2';
import { waitForCollectionsFromAPIv2 } from '../../collections/loaders/api-v2';
import { iconSetsStorage } from '../../storage/data/icon-set';
import { loadStorageItem } from '../../storage/functions';
import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from '../../storage/types/icon-set';
import type { IconFinderStorageError } from '../../storage/types/storage';
import { convertAPIv2IconSet } from '../convert/api-v2';

/**
 * Load icon set
 */
function loader(
	params: StoredIconFinderIconSetParams
): Promise<StoredIconFinderIconSet | IconFinderStorageError> {
	return new Promise((fulfill) => {
		const { provider, prefix } = params;
		const urlParams = new URLSearchParams({
			prefix,
			aliases: 'true',
			hidden: 'true',
		});

		// Send query
		_api.sendAPIQuery(
			provider,
			{
				type: 'custom',
				provider,
				uri: '/collection?' + urlParams.toString(),
			},
			waitForCollectionsFromAPIv2(
				provider,
				(data) => {
					const iconSet = convertAPIv2IconSet(
						provider,
						data as APIv2CollectionResponse
					);
					fulfill(iconSet || 503);
				},
				fulfill
			)
		);
	});
}

/**
 * Load icon set from API
 */
export function loadIconSetFromAPIv2(provider: string, prefix: string) {
	return loadStorageItem(iconSetsStorage, loader, {
		provider,
		prefix,
	});
}
