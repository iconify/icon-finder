import { UITranslation } from '../phrases/types';
// @iconify-replacement: '/phrases/en'
export { phrases } from '../phrases/en';

/**
 * Merge custom phrases
 */
export function mergePhrases(
	items: (UITranslation | Record<string, unknown>)[]
): UITranslation {
	function merge(items: Record<string, unknown>[]): Record<string, unknown> {
		const result = Object.create(null);

		// Keys and types
		const keys: Record<string, string> = Object.create(null);
		items.forEach((item) => {
			for (const key in item) {
				if (keys[key] === void 0) {
					keys[key] =
						item[key] === null
							? 'null'
							: item[key] instanceof Array
							? 'array'
							: typeof item[key];
				}
			}
		});

		// Merge all keys
		Object.keys(keys).forEach((key) => {
			const type = keys[key];

			// Get values to merge
			const values: unknown[] = [];
			items.forEach((item) => {
				if (typeof item === 'object' && typeof item[key] === type) {
					values.push(item[key]);
				}
			});

			// Merge
			switch (type) {
				case 'object':
					if (values.length > 1) {
						// Merge objects
						// console.log(`Merging objects for key ${key}`);
						result[key] = merge(
							values as Record<string, unknown>[]
						);
						return;
					}

				default:
					// Get last value
					// console.log(`Using last value for key ${key}`);
					result[key] = values.pop();
			}
		});

		return result;
	}

	// console.log('Merging', items);
	return (merge(
		items as Record<string, unknown>[]
	) as unknown) as UITranslation;
}
