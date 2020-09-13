/**
 * Merge values from default config and custom config
 *
 * This function returns value only if values should be merged in a custom way, such as making sure some objects don't mix
 * Returns undefined if default merge method should be used.
 */
export type IconFinderMerge = <T>(
	path: string,
	defaultValue: T,
	customValue: T
) => void | T;

/**
 * Validate parameter for merge()
 */
function isValidMergeParam(item): boolean {
	return (
		typeof item === 'object' && item !== null && !(item instanceof Array)
	);
}

/**
 * Function to merge items
 */
export function merge<T>(
	item1: T,
	item2: T | Record<string, unknown>,
	callback?: IconFinderMerge
): T {
	if (!isValidMergeParam(item1) || !isValidMergeParam(item2)) {
		throw new Error('Invalid configuration. Expected objects');
	}

	function mergeObjects(
		path: string[],
		item1: Record<string, unknown>,
		item2: Record<string, unknown>
	): Record<string, unknown> {
		// Attempt to resolve with a callback
		if (callback) {
			const customResult = callback(path.join('.'), item1, item2);
			if (typeof customResult !== 'undefined') {
				return customResult;
			}
		}

		// Merge objects
		const result = Object.create(null);

		// Copy item1
		for (const key in item1) {
			result[key] = item1[key];
		}

		// Copy item2
		Object.keys(item2).forEach((key) => {
			// New entry: copy it
			if (item1[key] === void 0) {
				result[key] = item2[key];
				return;
			}

			// Both objects have the same key
			const value1 = item1[key];
			let value2 = item2[key];

			if (
				typeof value1 !== typeof value2 ||
				typeof value1 !== 'object' ||
				value1 === null ||
				value2 === null ||
				value1 instanceof Array ||
				value2 instanceof Array
			) {
				// Different types, not objects, null or array: overwrite
				const newPath = path.concat([key]).join('.');
				if (callback) {
					// Attempt to use custom logic
					const customResult = callback(newPath, value1, value2);
					if (typeof customResult !== 'undefined') {
						result[key] = customResult;
						return;
					}
				}

				// Check for different types
				if (typeof value1 !== typeof value2) {
					throw new Error(
						'Logic for merging different types should be handled by merge() for ' +
							newPath
					);
				}
				if (value1 instanceof Array || value2 instanceof Array) {
					throw new Error(
						'Logic for merging arrays should be handled by merge() for ' +
							newPath
					);
				}

				result[key] = value2;
				return;
			}

			// Recurring merge
			result[key] = mergeObjects(
				path.concat([key]),
				value1 as Record<string, unknown>,
				value2 as Record<string, unknown>
			);
		});

		return result;
	}

	// Merge root objects
	return (mergeObjects(
		[],
		(item1 as unknown) as Record<string, unknown>,
		(item2 as unknown) as Record<string, unknown>
	) as unknown) as T;
}
