import { IconFinderConfig, createConfig } from '../data/config';
import { Events } from '../events';
import { API } from '../api/axios';
import { PartialRoute } from '../route/types';
import { Router } from '../route/router';
import { CollectionsData } from '../data/collections';
import {
	RegistryDataStorage,
	uniqueId,
	addRegistry,
	getSharedData,
	saveRegistry,
	destroyRegistry,
} from './storage';

/**
 * Registry parameters
 */
export interface RegistryParams {
	namespace?: string;
	config?: IconFinderConfig;
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

	constructor(params?: string | RegistryParams) {
		const namespace =
			typeof params === 'string'
				? params
				: typeof params === 'object' &&
				  typeof params.namespace === 'string'
				? params.namespace
				: 'iconify';
		this.namespace = namespace;

		// Get unique id based on namespace
		this.id = uniqueId(namespace);

		// Add namespace
		this.initialised = addRegistry(this);

		// Copy shared data
		this._sharedData = getSharedData(namespace);

		// Params
		this.params = typeof params === 'object' ? params : {};

		// Add instance
		this._save();
	}

	/**
	 * Save instance in registry list
	 */
	_save(): void {
		saveRegistry(this);
	}

	/**
	 * Get/set config
	 */
	get config(): IconFinderConfig {
		if (this._sharedData.config === void 0) {
			this._sharedData.config = createConfig(this.params.config);
		}
		return this._sharedData.config;
	}

	set config(value: IconFinderConfig) {
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
	get route(): PartialRoute | null {
		return this.router.route;
	}

	set route(value: PartialRoute | null) {
		this.router.route = value;
	}

	/**
	 * Get/set custom data
	 */
	getCustom(key: string, local = true): unknown {
		const data = local ? this._data : this._sharedData;
		if (data.custom === void 0) {
			return void 0;
		}
		return data.custom[key];
	}

	setCustom(key: string, value: unknown, local = true): void {
		const data = local ? this._data : this._sharedData;
		if (data.custom === void 0) {
			data.custom = Object.create(null);
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const custom = data.custom!;

		// Create getter and setter for local properties
		if (local && custom[key] === void 0) {
			Object.defineProperty(this, key, {
				get() {
					return custom[key];
				},
				set(value) {
					custom[key] = value;
				},
			});
		}

		custom[key] = value;
	}

	/**
	 * Destroy instance
	 */
	destroy(): void {
		destroyRegistry(this);
	}
}
