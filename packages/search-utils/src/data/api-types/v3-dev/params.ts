/**
 * Common stuff
 */
export interface APIv3CommonRequestParams {
	// Pretty output, default = false
	pretty?: boolean;
}

/**
 * Comma separated lists
 */
type CommaSeparatedStringArray = string;

type CommaSeparatedNumberArray = string;

/**
 * Prefixes list
 *
 * Separated by ','
 * Ends with '-' = partial prefix: 'fa-'
 * Does not end with '-' = full prefix: 'mdi'
 */
type PrefixesMatches = CommaSeparatedStringArray;

/**
 * Icon grid matches
 *
 * true = icon sets with `height` property
 * numbers = icon sets that match numbers
 */
type GridMatches = true | CommaSeparatedNumberArray;

/**
 * Filters for queries that affect multiple icon sets
 */
export interface APIv3IconSetFilters {
	// Include hidden icon sets
	hidden?: boolean;

	// Prefixes to include
	prefixes?: PrefixesMatches;

	// Categories to include
	categories?: CommaSeparatedStringArray;

	// Filter icon sets by grid
	grid?: GridMatches;

	// Filter by palette
	palette?: boolean;
}
