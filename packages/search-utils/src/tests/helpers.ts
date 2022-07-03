let providerCounter = 0;
let prefixCounter = 0;

/**
 * Get unique provider for tests
 */
export function nextProvider(): string {
	return 'provider-' + (providerCounter++).toString();
}

/**
 * Get unique prefix for tests
 */
export function nextPrefix(): string {
	return 'prefix-' + (prefixCounter++).toString();
}
