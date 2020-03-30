/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import {
	initRedundancy,
	Redundancy,
	RedundancyPendingItem,
	RedundancyQueryCallback,
} from '@cyberalien/redundancy';
import { Registry } from '../registry';

export interface APIParams {
	[index: string]: unknown;
}

export interface APICallback {
	(data: unknown, cached?: boolean): void;
}

export interface APICache {
	[index: string]: string | null;
}

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
						.map(item => paramToString(item, true))
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
	protected readonly _registry: Registry;
	protected _redundancy: Redundancy | null = null;
	protected _cache: APICache = Object.create(null);

	constructor(registry: Registry) {
		this._registry = registry;
		this._query = this._query.bind(this);
	}

	/**
	 * Send query
	 *
	 * @param endpoint End point string
	 * @param params Query parameters as object
	 * @param callback Callback to call when data is available
	 */
	query(
		endpoint: string,
		params: APIParams,
		callback: APICallback,
		ignoreCache = false
	): void {
		const uri = mergeQuery(endpoint, params);

		// Check for cache
		if (!ignoreCache && this._cache[uri] !== void 0) {
			// Return cached data on next tick
			setTimeout(() => {
				const cached = this._cache[uri];
				callback(cached === null ? null : JSON.parse(cached), true);
			});
			return;
		}

		// Init redundancy
		const redundancy: Redundancy =
			this._redundancy === null
				? this._initRedundancy()
				: this._redundancy;

		const query = redundancy.find(item => {
			const status = item();
			return status.status === 'pending' && status.payload === uri;
		});
		if (query !== null) {
			// Attach callback to existing query
			query().subscribe(data => {
				callback(data, false);
			});
			return;
		}

		// Create new query. Query will start on next tick, so no need to set timeout
		redundancy.query(uri, this._query as RedundancyQueryCallback, data => {
			callback(data, false);
		});
	}

	/**
	 * Check if query is cached
	 */
	isCached(endpoint: string, params: APIParams): boolean {
		const uri = mergeQuery(endpoint, params);
		return this._cache[uri] !== void 0;
	}

	/**
	 * Check if query is pending
	 */
	isPending(endpoint: string, params: APIParams): boolean {
		if (this._redundancy === null) {
			return false;
		}

		const uri = mergeQuery(endpoint, params);
		const query = this._redundancy.find(item => {
			const status = item();
			return status.status === 'pending' && status.payload === uri;
		});

		return query !== null;
	}

	/**
	 * Send query, callback from Redundancy
	 */
	_query(host: string, params: string, status: RedundancyPendingItem): void {
		// Should be implemented by child classes
		throw new Error('_query() should not be called on base API class');
	}

	/**
	 * Init redundancy
	 */
	_initRedundancy(): Redundancy {
		const config = this._registry.config;
		return (this._redundancy = initRedundancy(config.data.API));
	}

	/**
	 * Store cached data
	 */
	_storeCache(params: string, data: unknown): void {
		this._cache[params] = data === null ? null : JSON.stringify(data);
	}

	/**
	 * Clear all cache
	 */
	clearCache(): void {
		this._cache = Object.create(null);
	}
}
