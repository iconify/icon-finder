import type { APIv3IconsList } from './icons';
import type { APIv3ExtendedIconifyInfo } from './info';
import type { APIv3CommonRequestParams } from './params';

/**
 * Request
 */
export interface APIv3IconSetRequest extends APIv3CommonRequestParams {
	// Icon set prefix
	prefix: string;

	// Include hidden icons
	hidden?: boolean;

	// Return simple icons list, without metadata
	// If enabled, `icons` in response includes only aliases
	simple?: boolean;
}

/**
 * Icons data
 */
export interface APIv3IconSetIcons {
	// List of tags
	tags?: string[];

	// Icons list, split in multiple arrays with different defaults
	icons: APIv3IconsList[];
}

/**
 * Response
 */
export interface APIv3IconSetResponse extends APIv3IconSetIcons {
	// Icon set prefix
	prefix: string;

	// Icon set info, if available
	info?: APIv3ExtendedIconifyInfo;
}
