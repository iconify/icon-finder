import type {
	StoredIconFinderIconSet,
	StoredIconFinderIconSetParams,
} from './types/storage';
import type { IconFinderStorage } from '../storage/types';

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
