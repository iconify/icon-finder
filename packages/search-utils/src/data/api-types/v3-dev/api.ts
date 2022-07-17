import type { IconifyJSON } from '@iconify/types';
import type { APIv3ExtendedIconifyInfo, APIv3SampleURLs } from './info';
import type { APIv3CommonRequestParams, APIv3IconSetFilters } from './params';

/**
 * Request
 */
export interface APIv3APIRequest
	extends APIv3CommonRequestParams,
		APIv3IconSetFilters {
	//
}

/**
 * Response
 */
export interface APIv3APIResponse {
	// API title (default value, can be changed by UI)
	title: string;

	// Provider (default value, can be changed by UI)
	provider: string;

	// Icon sets
	iconSets: Record<string, APIv3ExtendedIconifyInfo>;

	// Data for samples, when displayed as SVG
	samples?: IconifyJSON[];

	// URL of sample images, when displayed as remote resource
	// Can be overridden for each icon set
	sampleURLs?: APIv3SampleURLs;
}
