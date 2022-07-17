import { collectionsAPIv2Loader } from '../collections/loaders/api-v2';
import { iconSetAPIv2Loader } from '../icon-set/loaders/api-v2';
import { searchAPIv2Loader } from '../search/loaders/api-v2';
import { loaders } from './loaders';

/**
 * Set loaders for API
 */
export function setAPIv2Loaders() {
	loaders.collections = collectionsAPIv2Loader;
	loaders.iconSet = iconSetAPIv2Loader;
	loaders.search = searchAPIv2Loader;
}
