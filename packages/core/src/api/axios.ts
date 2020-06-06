import { BaseAPI, APISendQueryCallback } from './base';
import { RedundancyPendingItem } from '@cyberalien/redundancy';
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
	sendQuery(
		host: string,
		params: string,
		callback: APISendQueryCallback
	): void {
		const instance = axios.create({
			baseURL: host,
		});
		instance
			.get(params)
			.then((response) => {
				if (response.status === 404) {
					// Not found. Should be called in error handler
					callback(false, null);
					return;
				}

				if (response.status !== 200) {
					return;
				}

				// Copy data. No need to parse it, axios parses JSON data
				const data = response.data;
				if (typeof data !== 'object' || data === null) {
					return;
				}

				// Store cache and complete
				callback(true, data);
			})
			.catch((err) => {
				if (
					typeof err === 'object' &&
					err.response &&
					err.response.status &&
					err.response.status === 404
				) {
					// Not found
					callback(false, null);
				}
			});
	}

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param provider Provider string
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param status Query status
	 */
	_query(
		provider: string,
		host: string,
		params: string,
		status: RedundancyPendingItem
	): void {
		// console.log('API request: ' + host + params);
		this.sendQuery(host, params, (success, data) => {
			if (!success) {
				if (data === null) {
					this._storeCache(provider, params, null);
				}
				status.done(null);
				return;
			}
			this._storeCache(provider, params, data);
			status.done(data);
		});
	}
}
