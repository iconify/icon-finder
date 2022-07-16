/**
 * Errors
 *
 * Common errors returned by Icon component:
 * 400 = bad request
 * 404 = not found
 * 424 = bad configuration
 * 501 = not implemented -> failed to parse JSON response
 * 503 = service unavailable -> fetch threw weird error
 *
 * Errors are changed to:
 * 404 = not found -> item not found, should show empty results
 * 503 = service unavailable -> error retrieving data or invalid data, should show error
 */
export type IconFinderStorageError = 404 | 503;

/**
 * Stored item
 */
export interface IconFinderStorageItem<T> {
	// Retrieved data, if available
	data?: T;

	// Error if failed
	error?: IconFinderStorageError;

	// Event that is fired when data is retrieved
	event: string;
}

/**
 * Stored data
 */
export type IconFinderStorageItems<T> = Map<string, IconFinderStorageItem<T>>;

/**
 * Interface for loader
 */
export type IconFinderStorageLoader<T, P> = (
	params: P
) => Promise<T | IconFinderStorageError>;

/**
 * Interface for storage
 */
export interface IconFinderStorage<T, P> {
	// Prefix for event
	eventPrefix: string;

	// Function to convert params to key
	key: (params: P) => string;

	// Storage
	storage: IconFinderStorageItems<T>;
}
