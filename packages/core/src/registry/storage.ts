import { FullIconFinderConfig } from '../data/config';
import { Events } from '../events';
import { API } from '../api/fetch';
import { Router } from '../route/router';
import { CollectionsData } from '../data/collections';
import { Registry } from './';

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
export interface RegistryDataStorage {
	// Shared
	config?: FullIconFinderConfig;
	events?: Events;
	api?: API;
	collections?: CollectionsData;

	// Local
	router?: Router;

	// Custom properties
	custom?: {
		[index: string]: unknown;
	};
}

/**
 * Storage of Registry instances
 */
interface RegistryStorage {
	[index: string]: Registry;
}

const registry: RegistryStorage = Object.create(null);

/**
 * Get unique id
 */
export function uniqueId(namespace: string): string {
	let counter = 0,
		id;

	while (registry[(id = namespace + counter)] !== void 0) {
		counter++;
	}
	return id;
}

/**
 * Add registry to storage
 */
export function addRegistry(registry: Registry): boolean {
	const namespace = registry.namespace,
		id = registry.id;

	if (namespaces[namespace] === void 0) {
		namespaces[namespace] = {
			ids: [id],
			data: Object.create(null),
		};
		return true;
	}

	namespaces[namespace].ids.push(id);
	return false;
}

/**
 * Save registry
 */
export function saveRegistry(item: Registry): void {
	registry[item.id] = item;
}

/**
 * Get shared data
 */
export function getSharedData(namespace: string): RegistryDataStorage {
	return namespaces[namespace].data;
}

/**
 * Delete registry entries
 */
export function destroyRegistry(item: Registry): void {
	if (registry[item.id] === void 0) {
		return;
	}

	// Delete registry from index
	delete registry[item.id];

	// Remove id from shared namespaces
	namespaces[item.namespace].ids = namespaces[item.namespace].ids.filter(
		(id) => id !== item.id
	);
}

/**
 * Get Registry instance for id.
 *
 * This is used to pass registry as constant string in React/Svelte, so changes in Registry instance won't trigger refresh of entire UI.
 */
export const getRegistry = (id: string): Registry => registry[id];
