/**
 * Optional properties for IconSetIconsListItem
 */
interface APIv3IconsListItemOptional {
	// Icon set prefix, used only in search results
	prefix?: string;

	// Icon is hidden
	hidden?: boolean;

	// Icon dimensions
	width?: number;
	height?: number;

	// Palette
	palette?: boolean;

	// Tags, list of indexes in `tags` array of response
	tags?: number[];
}

/**
 * Icon
 */
export interface APIv3IconsListItem extends APIv3IconsListItemOptional {
	// Icon name
	name: string;

	// Aliases
	alias?: string[];
	aliases?: string[];

	// Characters used in icon and its aliases
	char?: string;
	chars?: string[];
}

/**
 * Icons
 */
export type APIv3IconsListIcons = (string | APIv3IconsListItem)[];

/**
 * Icons list with common values
 */
export interface APIv3IconsListWithCommonValues {
	/**
	 * Default values for all icons in `icons` object
	 *
	 * If default value is set for an array, such as `tags` and icon also has same property, arrays are merged.
	 * If default value is not an array, it is used only for icons that do not have that property.
	 *
	 * Examples:
	 *
	 * { common: {width: 24, height: 24}, icons: ['test', {name: 'test2', width: 20}] }
	 *  =
	 * { icons: {name: 'test', width: 24, height: 24}, {name: 'test2', width: 20, height: 24} }
	 *
	 * { common: {tags: [0]}, icons: ['test1', {name: 'test2', tags: [1]}]}
	 *  =
	 * { icons: [{name: 'test1', tags: [0]}, {name: 'test2', tags: [0, 1]}]}
	 */
	common?: APIv3IconsListItemOptional;

	// List of icons. If string, value is a name
	icons: APIv3IconsListIcons;
}

/**
 * Icons list
 *
 * If array -> APIv3IconsListIcons
 * If not array -> APIv3IconsListWithCommonValues
 */
export type APIv3IconsList =
	| APIv3IconsListWithCommonValues
	| APIv3IconsListIcons;
