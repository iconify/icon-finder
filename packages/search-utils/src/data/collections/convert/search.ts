import type { IconifyInfo } from '@iconify/types';

/**
 * Generate search data for icon set
 */
export function generateSearchData(prefix: string, info: IconifyInfo): string {
	const searchData: string[] = [
		prefix,
		info.name,
		info.author.name,
		info.license.title,
	];
	if (info.height) {
		searchData.push(JSON.stringify(info.height));
	}

	return searchData.map((item) => item.toLowerCase()).join(' ');
}
