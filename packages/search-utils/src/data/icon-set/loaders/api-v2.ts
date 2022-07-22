import { _api } from 'iconify-icon';
import type { APIv2CollectionResponse } from '../../api-types/v2';
import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from '../types/storage';
import type { IconFinderStorageError } from '../../storage/types';
import { convertAPIv2IconSet } from '../convert/api-v2';
import { getLoaderError } from '../../storage/functions';

/**
 * Load icon set
 */
export function iconSetAPIv2Loader(
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
			(data, error) => {
				if (error) {
					// Failed
					fulfill(getLoaderError(error));
					return;
				}

				// Success
				fulfill(
					convertAPIv2IconSet(
						provider,
						data as APIv2CollectionResponse
					) || 503
				);
			}
		);
	});
}
