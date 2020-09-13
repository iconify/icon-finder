/**
 * Compare two objects.
 *
 * Copied from Core package
 *
 * This function does not handle anything other than primitive types + Arrays.
 */
export function compareObjects(obj1: unknown, obj2: unknown): boolean {
	if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
		return obj1 === obj2;
	}

	if (obj1 === obj2) {
		// Same object or both are null
		return true;
	}
	if (obj1 === null || obj2 === null) {
		// One of objects is null
		return false;
	}

	// Check for arrays
	if (obj1 instanceof Array) {
		if (!(obj2 instanceof Array)) {
			return false;
		}
		if (obj1.length !== obj2.length) {
			return false;
		}
		for (let i = 0; i < obj1.length; i++) {
			const value1 = obj1[i];
			const value2 = obj2[i];
			if (value1 !== value2) {
				// Different values. If both are objects, do deep comparison, otherwise return false
				if (
					typeof value1 !== 'object' ||
					typeof value2 !== 'object' ||
					!compareObjects(value1, value2)
				) {
					return false;
				}
			}
		}
		return true;
	} else if (obj2 instanceof Array) {
		return false;
	}

	// Not array
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let i = 0; i < keys1.length; i++) {
		const key = keys1[i];
		if (
			typeof (obj1 as Record<string, unknown>)[key] !==
			typeof (obj2 as Record<string, unknown>)[key]
		) {
			return false;
		}

		if (typeof (obj1 as Record<string, unknown>)[key] === 'object') {
			if (
				!compareObjects(
					(obj1 as Record<string, unknown>)[key],
					(obj2 as Record<string, unknown>)[key]
				)
			) {
				return false;
			}
		} else if (
			(obj1 as Record<string, unknown>)[key] !==
			(obj2 as Record<string, unknown>)[key]
		) {
			return false;
		}
	}

	return true;
}
