/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import {
	Redundancy,
	RedundancyPendingItem,
	RedundancyQueryCallback,
} from '@cyberalien/redundancy';
import { Registry } from '../registry';
import { getProvider } from '../data/providers';

export interface APIParams {
	[index: string]: unknown;
}

export interface APICallback {
	(data: unknown, cached?: boolean): void;
}

// Cache: [uri] = response
export interface APICache {
	[index: string]: string | null;
}

// Interface for sendQuery function exported by API modules
export type APISendQueryStatus = 'success' | 'not_found' | 'error';
export type APISendQueryCallback = (
	status: APISendQueryStatus,
	data: unknown
) => void;

/**
 * Add parameters to query
 */
export function mergeQuery(base: string, params: APIParams): string {
	let result = base,
		hasParams = result.indexOf('?') !== -1;

	/**
	 * Convertion of parameters to string, only allows simple types used by Iconify API
	 */
	function paramToString(value: unknown, nested: boolean): string {
		switch (typeof value) {
			case 'boolean':
				if (nested) {
					throw new Error('Nested boolean items are not allowed');
				}
				return value ? 'true' : 'false';

			case 'number':
				return encodeURIComponent(value);

			case 'string':
				return encodeURIComponent(value);

			case 'object':
				if (nested) {
					throw new Error('Nested objects are not allowed');
				}
				if (value instanceof Array) {
					return value
						.map((item) => paramToString(item, true))
						.join(',');
				}
				throw new Error('Objects are not allowed');

			default:
				throw new Error('Invalid type');
		}
	}

	Object.keys(params).forEach((key: string) => {
		let value;

		try {
			value = paramToString(params[key], false);
		} catch (err) {
			return;
		}

		result +=
			(hasParams ? '&' : '?') + encodeURIComponent(key) + '=' + value;
		hasParams = true;
	});

	return result;
}

/**
 * Base API class
 */
export class BaseAPI {
	// Registry instance
	protected readonly _registry: Registry;

	// Provider specific cache
	protected _cache: Record<string, APICache> = Object.create(null);

	/**
	 * Constructor
	 *
	 * @param registry
	 */
	constructor(registry: Registry) {
		this._registry = registry;
		this._query = this._query.bind(this);
	}

	/**
	 * Send query
	 *
	 * @param provider Provider
	 * @param endpoint End point string
	 * @param params Query parameters as object
	 * @param callback Callback to call when data is available
	 */
	query(
		provider: string,
		endpoint: string,
		params: APIParams,
		callback: APICallback,
		ignoreCache = false
	): void {
		const uri = mergeQuery(endpoint, params);

		// Check for cache
		if (this._cache[provider] === void 0) {
			this._cache[provider] = Object.create(null);
		}
		const providerCache = this._cache[provider];
		if (!ignoreCache && providerCache[uri] !== void 0) {
			// Return cached data on next tick
			setTimeout(() => {
				const cached = providerCache[uri];
				callback(cached === null ? null : JSON.parse(cached), true);
			});
			return;
		}

		// Init redundancy
		const redundancy = this._getRedundancy(provider);
		if (!redundancy) {
			// Error
			setTimeout(() => {
				callback(null, false);
			});
			return;
		}

		// Send query
		const query = redundancy.find((item) => {
			const status = item();
			return status.status === 'pending' && status.payload === uri;
		});
		if (query !== null) {
			// Attach callback to existing query
			query().subscribe((data) => {
				callback(data, false);
			});
			return;
		}

		// Create new query. Query will start on next tick, so no need to set timeout
		redundancy.query(
			uri,
			this._query.bind(this, provider) as RedundancyQueryCallback,
			(data) => {
				callback(data, false);
			}
		);
	}

	/**
	 * Check if query is cached
	 */
	isCached(provider: string, endpoint: string, params: APIParams): boolean {
		const uri = mergeQuery(endpoint, params);
		return (
			this._cache[provider] !== void 0 &&
			this._cache[provider][uri] !== void 0
		);
	}

	/**
	 * Check if query is pending
	 */
	isPending(provider: string, endpoint: string, params: APIParams): boolean {
		// Init redundancy
		const redundancy = this._getRedundancy(provider);
		if (!redundancy) {
			// Error
			return false;
		}

		const uri = mergeQuery(endpoint, params);
		const query = redundancy.find((item) => {
			const status = item();
			return status.status === 'pending' && status.payload === uri;
		});

		return query !== null;
	}

	/**
	 * Send query, callback from Redundancy
	 */
	_query(
		provider: string,
		host: string,
		params: string,
		status: RedundancyPendingItem
	): void {
		// Should be implemented by child classes
		throw new Error('_query() should not be called on base API class');
	}

	/**
	 * Store cached data
	 */
	_storeCache(provider: string, params: string, data: unknown): void {
		if (this._cache[provider] === void 0) {
			this._cache[provider] = Object.create(null);
		}
		this._cache[provider][params] =
			data === null ? null : JSON.stringify(data);
	}

	/**
	 * Clear all cache
	 */
	clearCache(): void {
		this._cache = Object.create(null);
	}

	/**
	 * Get Redundancy instance
	 */
	_getRedundancy(provider: string): Redundancy | null {
		// Init redundancy
		const providerData = getProvider(provider);
		if (!providerData) {
			// Error
			return null;
		}
		return providerData.redundancy;
	}
}
