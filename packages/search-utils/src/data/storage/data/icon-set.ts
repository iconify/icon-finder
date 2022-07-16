import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from '../types/icon-set';
import type { IconFinderStorage } from '../types/storage';

/**
 * Icon sets storage
 */
export const iconSetsStorage: IconFinderStorage<
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams
> = {
	/**
	 * Prefix for events
	 */
	eventPrefix: 'iconsets-',

	/**
	 * Key
	 */
	key: (params) => params.provider + ':' + params.prefix,

	/**
	 * Data
	 */
	storage: new Map(),
};
