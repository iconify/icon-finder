import { RedundancyConfig } from '@cyberalien/redundancy';
import { Data, DataStorage, DataChildStorage } from '../data';

/**
 * Redundancy for API servers.
 *
 * API should have very high uptime because of implemented redundancy at server level, but
 * sometimes bad things happen. On internet 100% uptime is not possible.
 *
 * There could be routing problems. Server might go down for whatever reason, but it takes
 * few minutes to detect that downtime, so during those few minutes API might not be accessible.
 *
 * This script has some redundancy to mitigate possible network issues.
 *
 * If one host cannot be reached in 'rotate' (750 by default) ms, script will try to retrieve
 * data from different host. Hosts have different configurations, pointing to different
 * API servers hosted at different providers.
 */
const fallBackAPISources = [
	'https://api1.simplesvg.com',
	'https://api2.iconify.design',
];

// Shuffle fallback API
const fallBackAPI: string[] = [];
while (fallBackAPISources.length > 0) {
	if (fallBackAPISources.length === 1) {
		fallBackAPI.push(fallBackAPISources.shift() as string);
	} else {
		// Get first or last item
		if (Math.random() > 0.5) {
			fallBackAPI.push(fallBackAPISources.shift() as string);
		} else {
			fallBackAPI.push(fallBackAPISources.pop() as string);
		}
	}
}

/**
 * Default configuration.
 *
 * 2 levels deep object:
 * object[key][key2] = value
 */
const defaultConfig: DataStorage = {
	// API
	API: (({
		// API hosts
		resources: ['https://api.iconify.design'].concat(fallBackAPI),

		// Timeout before next host is used.
		rotate: 750,

		// Timeout to retry same host.
		timeout: fallBackAPI.length > 0 ? 5000 : 3000,

		// Number of attempts for each host.
		limit: 2,

		// Randomise default API end point.
		random: false,
	} as RedundancyConfig) as unknown) as DataChildStorage,

	// Display
	display: {
		// Number of icons per page.
		itemsPerPage: 52,

		// Maximum delay between changing current view and updating visible view.
		// This delay is used to avoid "loading" page when changing views.
		viewUpdateDelay: 300,

		// Number of sibling collections to show when collection view is child view of collections list.
		showSiblingCollections: 2,
	},
};

/**
 * Config class
 */
export class Config extends Data {
	/**
	 * Set default value
	 */
	_setDefault(): void {
		this._default = defaultConfig;
	}
}
