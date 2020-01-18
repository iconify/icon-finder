/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { BaseAPI } from './base';
import { RedundancyPendingItem } from '@cyberalien/redundancy';
import axios from 'axios';

export class API extends BaseAPI {
	/**
	 * Send query, callback from Redundancy
	 *
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param status Query status
	 */
	_query(host: string, params: string, status: RedundancyPendingItem): void {
		console.log('API request: ' + host + params);
		const instance = axios.create({
			baseURL: host,
		});
		instance
			.get(params)
			.then(response => {
				if (response.status === 404) {
					// Not found. Should be called in error handler
					this._storeCache(params, null);
					status.done(null);
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
				this._storeCache(params, data);
				status.done(data);
			})
			.catch(err => {
				if (
					typeof err === 'object' &&
					err.response &&
					err.response.status &&
					err.response.status === 404
				) {
					// Not found
					this._storeCache(params, null);
					status.done(null);
				}
			});
	}
}
