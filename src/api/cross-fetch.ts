import type {
	PendingQueryItem,
	QueryDoneCallback,
} from '@cyberalien/redundancy';
import { BaseAPI } from './base';
import fetch from 'cross-fetch';

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
		fetch(host + params)
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
