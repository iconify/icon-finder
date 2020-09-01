/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import {
	mergeQuery,
	BaseAPI,
	APIParams,
	APISendQueryCallback,
} from '../lib/api/base';
import { Registry } from '../lib/registry';
import {
	Redundancy,
	RedundancyPendingItem,
	initRedundancy,
} from '@cyberalien/redundancy';
import { getAPIConfig } from './fake_api_config';
import { getFixture } from './get_fixture';

/**
 * API parameters
 */
interface FakeAPIParams {
	responseDelay?: number;
	cacheResult?: boolean;
	attempt?: number;
}

const defaultParams: FakeAPIParams = {
	responseDelay: 10,
	cacheResult: false,
	attempt: 1,
};

interface FakeAPIData extends FakeAPIParams {
	data: string | null;
}

interface FakeAPIStorage {
	[index: string]: FakeAPIData;
}

/**
 * Fake API
 *
 * Instead of sending request to real API, this class loads data from json files that contain API responses and sends their contents
 */
export class API extends BaseAPI {
	public log: string[] = [];
	public fakeData: Record<string, FakeAPIStorage> = Object.create(null);
	protected _redundancy: Record<string, Redundancy | null> = Object.create(
		null
	);

	/**
	 * Get Redundancy instance
	 */
	_getRedundancy(provider: string): Redundancy | null {
		if (this._redundancy[provider] === void 0) {
			const config = getAPIConfig('');
			if (!config) {
				throw new Error('Failed to get API config!');
			}
			this._redundancy[provider] = initRedundancy(config);
		}
		return this._redundancy[provider];
	}

	/**
	 * Send query without provider
	 *
	 * @param host
	 * @param params
	 * @param callback
	 */
	sendQuery(
		host: string,
		params: string,
		callback: APISendQueryCallback
	): void {
		throw new Error('Not supported by fake API');
	}

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param provider Provider
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
		const uri = host + params;
		this.log.push(uri);

		if (
			this.fakeData[provider] === void 0 ||
			this.fakeData[provider][params] === void 0
		) {
			// Missing fixture. Throw error
			throw new Error(`Missing fake API data for ${params}`);
		}
		const data = this.fakeData[provider][params];

		// Check attempt
		if (status.attempt !== data.attempt) {
			return;
		}

		// Send response
		setTimeout(() => {
			let response;
			try {
				response = data.data === null ? null : JSON.parse(data.data);
			} catch (err) {
				response = data.data;
			}
			if (data.cacheResult) {
				this._storeCache(provider, params, response);
			}
			status.done(response);
		}, data.responseDelay);
	}

	/**
	 * Set fake API data
	 */
	setFakeData(
		provider: string,
		query: string,
		queryParams: APIParams,
		data: string | null,
		params: FakeAPIParams = {}
	): void {
		const uri = mergeQuery(query, queryParams);
		if (this.fakeData[provider] === void 0) {
			this.fakeData[provider] = Object.create(null);
		}
		this.fakeData[provider][uri] = Object.assign(
			{
				data: data,
			},
			defaultParams,
			params
		);
	}

	/**
	 * Load fixture
	 */
	loadFixture(
		provider: string,
		query: string,
		queryParams: APIParams,
		filename: string,
		params: FakeAPIParams = {}
	): void {
		const data = getFixture(filename + '.json');
		this.setFakeData(provider, query, queryParams, data, params);
	}
}
