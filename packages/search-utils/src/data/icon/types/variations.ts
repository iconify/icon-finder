import type { IconifyIcon } from '@iconify/types';

/**
 * Variation types
 */
export type IconFinderIconVariationThemeType = 'prefixes' | 'suffixes';

export type IconFinderIconVariationTransitionType =
	| 'transition-from'
	| 'transition-to';

export type IconFinderIconVariationsType =
	// Themes
	| IconFinderIconVariationThemeType
	// Transformations
	| 'transform'
	// Transition from one icon to another, used in SVG animations
	| IconFinderIconVariationTransitionType;

/**
 * Variations
 */
interface BaseIconFinderIconVariation {
	// Variation type: 'prefix', 'suffix'
	type: IconFinderIconVariationsType;

	// Icon name
	name: string;
}

// Themes
export interface IconFinderIconThemeVariation
	extends BaseIconFinderIconVariation {
	type: IconFinderIconVariationThemeType;

	// Suffix or prefix value
	themeKey: string;
}

// Transformations
export type IconVariationTransformations = Required<
	Pick<IconifyIcon, 'hFlip' | 'vFlip' | 'rotate'>
>;

export interface IconFinderIconTransformVariation
	extends BaseIconFinderIconVariation,
		IconVariationTransformations {
	type: 'transform';
}

// Transitions in SVG animations
export interface IconFinderIconTransitionVariation
	extends BaseIconFinderIconVariation {
	type: IconFinderIconVariationTransitionType;

	// Icon name
	name2: string;
}

// Mix
export type IconFinderIconVariation =
	| IconFinderIconThemeVariation
	| IconFinderIconTransformVariation
	| IconFinderIconTransitionVariation;

/**
 * List
 */
export type IconFinderIconVariationsList = Partial<
	Record<IconFinderIconVariationsType, IconFinderIconVariation[]>
>;
