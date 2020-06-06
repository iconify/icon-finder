import {
	cloneObject,
	DataStorage,
	setData,
	customisedData,
} from '@iconify/search-core';

/**
 * Layout options
 */
export interface IconFinderLayoutOptions {
	// Icons list mode.
	list?: boolean;
	// True if icons list mode can be changed.
	toggleList?: boolean;
}

/**
 * Options
 */
export interface IconFinderOptions {
	layout?: IconFinderLayoutOptions;
}

/**
 * Default values
 */
const defaultLayoutOptions: Required<IconFinderLayoutOptions> = {
	// Icons list mode.
	list: false,
	// True if icons list mode can be changed.
	toggleList: true,
};

const defaultOptions: Required<IconFinderOptions> = {
	layout: defaultLayoutOptions,
};

/**
 * Create options object
 */
export function createOptions(
	customValues: IconFinderOptions = {}
): IconFinderOptions {
	const options: IconFinderOptions = cloneObject(
		defaultOptions
	) as IconFinderOptions;
	if (customValues) {
		setData(options as DataStorage, customValues as DataStorage);
	}
	return options;
}

/**
 * Get customised Optionsuration values
 */
export function customisedOptions(
	options: IconFinderOptions
): IconFinderOptions {
	return customisedData(
		options as DataStorage,
		(defaultOptions as unknown) as DataStorage
	) as IconFinderOptions;
}
