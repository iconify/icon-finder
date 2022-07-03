/**
 * Overwrite value
 */
export function overwriteValue<T>(
	defaultValue: T,
	value1: T | undefined,
	value2: T | undefined
): T {
	return value1 !== void 0
		? value1
		: value2 !== void 0
		? value2
		: defaultValue;
}
