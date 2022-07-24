import { collectionsFSLoader } from '../collections/loaders/fs';
import { iconSetFSLoader } from '../icon-set/loaders/fs';
import { loaders } from '../../config/loaders';

/**
 * Set loaders for `@iconify/json` or `https://github.com/iconify/icon-sets`
 *
 * Path is path to root directory, where `collections.json` is.
 * Icon sets will be loaded from `json/{prefix}.json`
 *
 * Search results are not available
 *
 * Icon sets loader for file system does not load collections list. Load collections list first!
 */
export function setIconifyIconSetsFSLoaders(path: string) {
	loaders.collections = () => collectionsFSLoader(path + '/collections.json');
	loaders.iconSet = (params) =>
		iconSetFSLoader(path + '/json/' + params.prefix + '.json', params);
}
