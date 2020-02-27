/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import { BaseAPI, mergeQuery } from './base';
import { RedundancyPendingItem } from '@cyberalien/redundancy';

/**
 * Get hash for query
 *
 * Hash is used in JSONP callback name, so same queries end up with same JSONP callback,
 * allowing response to be cached in browser.
 */
function hash(str: string): number {
	let total = 0,
		i;

	for (i = str.length - 1; i >= 0; i--) {
		total += str.charCodeAt(i);
	}

	return total % 999;
}

/**
 * External global added to window
 */
export const externalGlobal = 'IconifySearch';
export const callbackPrefix = 'cb';

/**
 * Types for exporting global function
 */
interface JSONPCallback {
	(data: unknown): void;
}
interface CallbackRoot {
	[index: string]: JSONPCallback;
}
interface Window {
	[index: string]: CallbackRoot;
}

/**
 * Browser API class
 */
export class API extends BaseAPI {
	/**
	 * Send query, callback from Redundancy
	 *
	 * @param host Host string
	 * @param params End point and parameters as string
	 * @param status Query status
	 */
	_query(host: string, params: string, status: RedundancyPendingItem): void {
		// Expose global
		const w = (window as unknown) as Window;
		if (w[externalGlobal] === void 0) {
			w[externalGlobal] = Object.create(null);
		}

		// Get callback
		const root: CallbackRoot = w[externalGlobal];
		let counter = hash(params),
			func: string;

		while (root[(func = callbackPrefix + counter)] !== void 0) {
			counter++;
		}

		// Create callback
		root[func] = (data: unknown): void => {
			this._storeCache(params, data);
			status.done(data);
		};

		// Create URI
		const uri =
			host +
			mergeQuery(params, {
				callback: externalGlobal + '.' + func,
			});

		// Create script and append it to head
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = uri;
		document.head.appendChild(script);
	}
}
