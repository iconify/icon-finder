import { BaseAPI, APISendQueryCallback } from './base';
import { RedundancyPendingItem } from '@cyberalien/redundancy';

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
		fetch(host + params)
			.then((response) => {
				if (response.status === 404) {
					// Not found. Should be called in error handler
					callback('not_found', null);
					return;
				}

				if (response.status !== 200) {
					callback('error', null);
					return;
				}

				return response.json();
			})
			.then((data) => {
				if (typeof data !== 'object' || data === null) {
					callback('error', null);
					return;
				}

				// Store cache and complete
				callback('success', data);
			})
			.catch(() => {
				callback('error', null);
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
		this.sendQuery(host, params, (response, data) => {
			switch (response) {
				case 'success':
				case 'not_found':
					this._storeCache(provider, params, data);
					status.done(data);
			}
		});
	}
}
