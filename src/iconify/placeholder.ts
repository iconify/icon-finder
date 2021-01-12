import type { IconifyIconCustomisations } from '@iconify/iconify';
import type { IconifyRenderHTML } from './index';

/**
 * Generate placeholder element for SVG framework
 */
export const renderPlaceholder: IconifyRenderHTML = (
	name: string,
	customisations: IconifyIconCustomisations
) => {
	let html = '<span class="iconify" data-icon="' + name + '"';

	// Alignment and flip
	const flip: string[] = [];
	const alignment: string[] = [];

	let key: keyof IconifyIconCustomisations;
	for (key in customisations) {
		const value = customisations[key];
		if (value === void 0 || value === null || value === 0 || value === '') {
			continue;
		}

		switch (key) {
			case 'hFlip':
				if (value) {
					flip.push('horizontal');
				}
				break;

			case 'vFlip':
				if (value) {
					flip.push('vertical');
				}
				break;

			case 'hAlign':
			case 'vAlign':
				alignment.push(value as string);
				break;

			case 'slice':
				alignment.push(value ? 'slice' : 'meet');
				break;

			default:
				if (value !== false) {
					html +=
						' data-' +
						key +
						'="' +
						(value === true ? 'true' : value) +
						'"';
				}
		}
	}

	if (flip.length > 0) {
		html += ' data-flip="' + flip.join(',') + '"';
	}
	if (alignment.length > 0) {
		html += ' data-align="' + alignment.join(',') + '"';
	}

	html += '></span>';

	return html;
};
