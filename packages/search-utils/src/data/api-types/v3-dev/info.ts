import type { IconifyInfo } from '@iconify/types';

/**
 * Sample URLs. Used when samples should be generated on server side instead of rendering SVG
 */
export interface APIv3SampleURL {
	// Maximum height when sample is used. This allows UI to use smallest sample possible for optimisation
	maxHeight?: number;

	// URL of sample. Can contain {prefix} for icon set prefix, must contain {name} for icon name.
	// If starts with '/', it is relative to API host, otherwise must start with 'https://'
	URL: string;
}

/**
 * List of URLs
 */
export type APIv3SampleURLs = APIv3SampleURL[];

/**
 * Sample image data
 */
export interface APIv3SampleImage {
	name: string;
	width: number;
	height: number;
}

/**
 * Extra data for IconifyInfo type
 */
export interface APIv3ExtendedIconifyInfo extends IconifyInfo {
	// URL of sample images
	sampleURLs?: APIv3SampleURLs;

	// Sample images with dimensions
	sampleData?: APIv3SampleImage[];
}
