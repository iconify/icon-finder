/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { mergeQuery, BaseAPI, APIParams } from '../lib/api/base';
import { RedundancyPendingItem } from '@cyberalien/redundancy';
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
	public fakeData: FakeAPIStorage = Object.create(null);

	/**
	 * Send query, callback from Redundancy
	 *
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param status Query status
	 */
	_query(host: string, params: string, status: RedundancyPendingItem): void {
		const uri = host + params;
		this.log.push(uri);
		if (this.fakeData[params] === void 0) {
			// Missing fixture. Throw error
			throw new Error(`Missing fake API data for ${params}`);
		}
		const data = this.fakeData[params];

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
				this._storeCache(params, response);
			}
			status.done(response);
		}, data.responseDelay);
	}

	/**
	 * Set fake API data
	 */
	setFakeData(
		query: string,
		queryParams: APIParams,
		data: string | null,
		params: FakeAPIParams = {}
	): void {
		const uri = mergeQuery(query, queryParams);
		this.fakeData[uri] = Object.assign(
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
		query: string,
		queryParams: APIParams,
		filename: string,
		params: FakeAPIParams = {}
	): void {
		const data = getFixture(filename + '.json');
		this.setFakeData(query, queryParams, data, params);
	}
}
