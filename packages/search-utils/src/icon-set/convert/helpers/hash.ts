/**
 * Create basic hash
 */
export function hashString(content: string): string {
	let hash = 0;
	const length = content.length;
	for (let i = 0; i < length; i++) {
		const char = content.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return `${length}.${hash}`;
}
