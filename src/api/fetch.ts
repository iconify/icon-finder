import type {
	PendingQueryItem,
	QueryDoneCallback,
} from '@cyberalien/redundancy';
import { BaseAPI } from './base';

/**
 * Fetch function
 *
 * Use this to set 'cross-fetch' in node.js environment if you are retrieving icons on server side.
 * Not needed when using stuff like Next.js or SvelteKit because components use API only on client side.
 */
let fetchModule: typeof fetch | null = null;
try {
	fetchModule = fetch;
} catch (err) {
	//
}

export function setFetch(fetch: typeof fetchModule): void {
	fetchModule = fetch;
}

/**
 * API class
 */
export class API extends BaseAPI {
	/**
	 * Send API query without provider
	 *
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param callback Callback
	 */
	sendQuery(host: string, params: string, callback: QueryDoneCallback): void {
		if (!fetchModule) {
			// Fail: return 424 Failed Dependency (its not meant to be used like that, but it is the best match)
			callback(void 0, 424);
			return;
		}

		fetchModule(host + params)
			.then((response) => {
				if (response.status !== 200) {
					callback(void 0, response.status);
					return;
				}

				return response.json();
			})
			.then((data) => {
				if (data === void 0) {
					// Return from previous then() without Promise
					return;
				}
				if (typeof data !== 'object' || data === null) {
					// Error
					callback(void 0, null);
					return;
				}

				// Store cache and complete
				callback(data);
			})
			.catch((err) => {
				callback(void 0, err?.errno);
			});
	}

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param provider Provider string
	 * @param cacheKey API cache key, null if data should not be cached
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param item Query item
	 */
	_query(
		provider: string,
		cacheKey: string | null,
		host: string,
		params: string,
		item: PendingQueryItem
	): void {
		// console.log('API request: ' + host + params);
		this.sendQuery(host, params, (data, error) => {
			if (data !== void 0 && cacheKey !== null) {
				// Store cache on success
				this.storeCache(provider, cacheKey, data);
			}

			item.done(data, error);
		});
	}
}
