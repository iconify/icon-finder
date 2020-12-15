/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import type { APIParams } from '../lib/api/base';
import { mergeQuery, BaseAPI } from '../lib/api/base';
import type {
	Redundancy,
	QueryDoneCallback,
	PendingQueryItem,
} from '@cyberalien/redundancy';
import { initRedundancy } from '@cyberalien/redundancy';
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
	responseDelay: 0,
	cacheResult: false,
	attempt: -1,
};

interface FakeAPIData extends Required<FakeAPIParams> {
	result?: string;
	error?: unknown;
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
	protected _resources: Record<string, unknown[]> = Object.create(null);

	/**
	 * Get Redundancy instance
	 */
	_getRedundancy(provider: string): Redundancy | null {
		// Return null for 'invalid-provider', default Redundancy instance for other providers
		if (provider === 'invalid-provider') {
			return null;
		}

		if (this._redundancy[provider] === void 0) {
			const config = getAPIConfig('');
			if (!config) {
				throw new Error('Failed to get API config!');
			}
			this._redundancy[provider] = initRedundancy(config);
			this._resources[provider] = config.resources;
		}
		return this._redundancy[provider];
	}

	/**
	 * Get attempt number
	 */
	getAttempt(provider: string, resource: unknown): number {
		const resources = this._resources[provider];
		if (!resources) {
			throw new Error(`Missing provider: ${provider}`);
		}
		return resources.indexOf(resource);
	}

	/**
	 * Send query without provider
	 *
	 * @param host
	 * @param params
	 * @param callback
	 */
	sendQuery(host: string, params: string, callback: QueryDoneCallback): void {
		throw new Error('Not supported by fake API');
	}

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param provider Provider
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
		if (
			data.attempt >= 0 &&
			this.getAttempt(provider, item.resource) !== data.attempt
		) {
			return;
		}

		// Send response
		const respond = () => {
			if (typeof data.result === 'string') {
				let response;
				try {
					response =
						data.result === null ? null : JSON.parse(data.result);
					if (data.cacheResult && cacheKey !== null) {
						this.storeCache(provider, cacheKey, response);
					}
				} catch (err) {
					response = data.result;
				}
				item.done(response);
			} else {
				item.done(void 0, data.error);
			}
		};

		if (data.responseDelay) {
			setTimeout(respond, data.responseDelay);
		} else {
			// Can be synchronous because it is wrapped in setTimeout in Redundancy instance (and tested in view tests)
			respond();
		}
	}

	/**
	 * Set fake API data
	 */
	setFakeData(
		provider: string,
		query: string,
		queryParams: APIParams,
		result: string | undefined,
		error: unknown,
		params: FakeAPIParams
	): void {
		const uri = mergeQuery(query, queryParams);
		if (this.fakeData[provider] === void 0) {
			this.fakeData[provider] = Object.create(null);
		}
		this.fakeData[provider][uri] = Object.assign(
			{
				result,
				error,
			},
			defaultParams,
			params
		) as FakeAPIData;
	}

	/**
	 * Load fixture
	 */
	loadFixture(
		provider: string,
		query: string,
		queryParams: APIParams,
		filename: string,
		params: FakeAPIParams = {},
		cacheKey = '',
		storeCache = false
	): void {
		const data = getFixture(filename + '.json');
		if (cacheKey !== '' && storeCache) {
			// Store as cache
			this.storeCache(provider, cacheKey, JSON.parse(data));
		} else {
			this.setFakeData(
				provider,
				query,
				queryParams,
				data,
				void 0,
				params
			);
		}
	}
}
