import type { IconFinderIconName } from './name';
import type { IconFinderIconVariationsList } from './variations';

/**
 * Icon
 */
export interface IconFinderIcon {
	// Icon name
	name: IconFinderIconName;

	// Aliases
	aliases: string[];

	// Variations
	variations: IconFinderIconVariationsList;

	// Icon is hidden
	hidden?: boolean;
}
