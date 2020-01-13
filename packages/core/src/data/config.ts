import { RedundancyConfig } from '@cyberalien/redundancy';
import { Data, DataStorage, DataChildStorage } from '../data';

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
		resources: [
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
			// All Iconify API servers
			'https://api.iconify.design',

			/**
			 * All Iconify API servers split into 2 sets.
			 *
			 * If server in one set goes down, script will try to access data from another set.
			 * One of sets uses different host name to avoid interruption if there is a DNS problem.
			 */
			'https://api1.simplesvg.com',
			'https://api2.iconify.design',
		],

		// Timeout before next host is used.
		rotate: 750,

		// Timeout to retry same host. Change it to lower number if there is only 1 available host
		timeout: 5000,

		// Number of attempts for each host.
		limit: 2,

		// Randomise default API end point.
		random: true,
	} as RedundancyConfig) as unknown) as DataChildStorage,

	// Display
	display: {
		// Number of icons per page.
		itemsPerPage: 52,

		// Maximum delay between changing current view and updating visible view.
		// This delay is used to avoid "loading" page when changing views.
		viewUpdateDelay: 300,
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
