/**
 * Callback to call when filter has been toggled
 *
 * @param {boolean} selected True if filter was selected, false if unselected
 * @returns {boolean} True if filter can be toggled, false if event should be ignored
 */
export type IconFinderFilterCallback = (selected: boolean) => boolean;

/**
 * Filter
 */
export interface IconFinderFilter {
	// Filter title
	title: string;

	// True if disabled
	disabled?: boolean;

	// True if filter should be hidden if disabled
	hiddenIfDisabled?: boolean;

	// Palette index
	color?: number;

	// Event to call when clicked
	event?: IconFinderFilterCallback;
}

/**
 * Filter for categories in collections list
 */
export type IconFinderCategoriesFilter = IconFinderFilter;

/**
 * Filter for categories in icon set
 */
export type IconFinderTagsFilter = IconFinderFilter;

/**
 * Filter for theme
 */
export interface IconFinderThemeFilter extends IconFinderFilter {
	// Prefix or suffix match, including '-'
	match: string;
}
