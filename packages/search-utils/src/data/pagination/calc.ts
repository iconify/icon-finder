import { utilsConfig } from '../../config/ui';
import type { IconFinderIconsListPagination } from './types/results';
import type { IconFinderPaginationConfig } from './types/config';

/**
 * Generate pagination result
 */
export function getPaginationResult(
	config: IconFinderPaginationConfig,
	total: number,
	page?: number
): IconFinderIconsListPagination {
	const perPage = config.perPage || utilsConfig.iconsPerPage;
	const maxPage = total && perPage && Math.floor((total - 1) / perPage);

	return {
		perPage,
		total,
		page: Math.min(maxPage, page || config.page || 0),
		maxPage,
		totalPages: total && maxPage + 1,
	};
}
