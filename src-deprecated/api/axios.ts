import { BaseAPI } from '@iconify/search-core/lib/api/base';
import type {
	PendingQueryItem,
	QueryDoneCallback,
} from '@cyberalien/redundancy';
import axios from 'axios';

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
		const instance = axios.create({
			baseURL: host,
		});
		instance
			.get(params)
			.then((response) => {
				if (response.status !== 200) {
					callback(void 0, response.status);
					return;
				}

				// Copy data. No need to parse it, axios parses JSON data
				const data = response.data;
				if (typeof data !== 'object' || data === null) {
					callback(void 0, null);
					return;
				}

				// Store cache and complete
				callback(data);
			})
			.catch((err) => {
				// Error
				callback(void 0, err?.response?.status);
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
