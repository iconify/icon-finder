import type { IconVariationTransformations } from '../../../icon/types/variations';

/**
 * Merge transformations
 */
export function mergeTransformations(
	item1: Partial<IconVariationTransformations>,
	item2: Partial<IconVariationTransformations>
): IconVariationTransformations {
	return {
		// convert to boolean to avoid comparing false and undefined
		hFlip: !item1.hFlip !== !item2.hFlip,
		vFlip: !item1.vFlip !== !item2.vFlip,
		rotate: ((item1.rotate || 0) + (item2.rotate || 0)) % 4,
	};
}
