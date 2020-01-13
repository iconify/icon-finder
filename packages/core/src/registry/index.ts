import { DataStorage } from '../data';
import { Config } from '../data/config';
import { Events } from '../events';
import { API } from '../api/axios';
import { Route } from '../route/types';
import { Router } from '../route/router';
import { CollectionsData } from '../data/collections';

/**
 * Shared data storage per namespace
 */
interface RegistryNamespace {
	ids: string[];
	data: {};
}

interface RegistryNamespaces {
	[index: string]: RegistryNamespace;
}

const namespaces: RegistryNamespaces = Object.create(null);

/**
 * Registry data storage
 */
interface RegistryDataStorage {
	// Shared
	config?: Config;
	events?: Events;
	api?: API;
	collections?: CollectionsData;

	// Local
	route?: Route | null;
	router?: Router;
}

/**
 * Storage of Registry instances
 */
interface RegistryStorage {
	[index: string]: Registry;
}

const registry: RegistryStorage = Object.create(null);

/**
 * Registry parameters
 */
export interface RegistryParams {
	namespace?: string;
	config?: DataStorage;
}

/**
 * Registry class
 */
export class Registry {
	public readonly namespace: string;
	public readonly id: string;
	public readonly initialised: boolean;
	public readonly params: RegistryParams;

	protected _data: RegistryDataStorage = Object.create(null);
	protected _sharedData: RegistryDataStorage;

	constructor(
		namespace: string,
		id: string,
		initialised: boolean,
		params: RegistryParams
	) {
		this.namespace = namespace;
		this.id = id;
		this.initialised = initialised;
		this.params = params;
		this._sharedData = namespaces[namespace].data;
	}

	/**
	 * Get/set config
	 */
	get config(): Config {
		if (this._sharedData.config === void 0) {
			const item = (this._sharedData.config = new Config());
			if (this.params.config) {
				item.set(this.params.config);
			}
		}
		return this._sharedData.config;
	}

	set config(value: Config) {
		this._sharedData.config = value;
	}

	/**
	 * Get/set events
	 */
	get events(): Events {
		if (this._data.events === void 0) {
			this._data.events = new Events();
		}
		return this._data.events;
	}

	set events(value: Events) {
		this._data.events = value;
	}

	/**
	 * Get/set API
	 */
	get api(): API {
		if (this._sharedData.api === void 0) {
			this._sharedData.api = new API(this);
		}
		return this._sharedData.api;
	}

	set api(value: API) {
		this._sharedData.api = value;
	}

	/**
	 * Get/set collections
	 */
	get collections(): CollectionsData {
		if (this._sharedData.collections === void 0) {
			this._sharedData.collections = new CollectionsData();
		}
		return this._sharedData.collections;
	}

	set collections(value: CollectionsData) {
		this._sharedData.collections = value;
	}

	/**
	 * Set/set router
	 */
	get router(): Router {
		if (this._data.router === void 0) {
			this._data.router = new Router(this.id);
		}
		return this._data.router;
	}

	set router(value: Router) {
		this._data.router = value;
	}

	/**
	 * Set/set route
	 */
	get route(): Route | null {
		if (this._data.route === void 0) {
			return null;
		}
		return this._data.route;
	}

	set route(value: Route | null) {
		this._data.route = value;
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		if (registry[this.id] === void 0) {
			return;
		}

		// Delete registry from index
		delete registry[this.id];

		// Remove id from shared namespaces
		namespaces[this.namespace].ids = namespaces[this.namespace].ids.filter(
			id => id !== this.id
		);
	}
}

/**
 * Create new registry with shared namespace, return registry id.
 */
export const createRegistry = (params?: string | RegistryParams): Registry => {
	const namespace =
		typeof params === 'string'
			? params
			: typeof params === 'object' && typeof params.namespace === 'string'
			? params.namespace
			: 'iconify';

	// Generate unique id based on namespace
	let counter = 0,
		id;

	while (registry[(id = namespace + counter)] !== void 0) {
		counter++;
	}

	// Add namespace
	let initialised = false;
	if (namespaces[namespace] === void 0) {
		namespaces[namespace] = {
			ids: [id],
			data: Object.create(null),
		};
		initialised = true;
	} else {
		namespaces[namespace].ids.push(id);
	}

	// Create Registry instance
	const item = new Registry(
		namespace,
		id,
		initialised,
		typeof params === 'object' ? params : {}
	);
	registry[id] = item;

	// Return Registry instance
	return item;
};

/**
 * Get Registry instance for id.
 *
 * This is used to pass registry as constant string in React/Svelte, so changes in Registry instance won't trigger refresh of entire UI.
 */
export const getRegistry = (id: string): Registry => registry[id];
