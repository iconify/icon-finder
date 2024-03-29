/**
 * Search query
 */
export interface IconFinderSearchQuery {
	// API provider
	provider: string;

	// Search keyword. Cannot be empty
	keyword: string;

	// Results limit
	limit: number;

	// Filter by category
	category?: string;

	// Filter by prefixes
	prefixes?: string[];
}
