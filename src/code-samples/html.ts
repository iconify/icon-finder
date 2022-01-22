import type { FullIconifyIcon } from '@iconify/utils/lib/icon';
import { iconToSVG } from '@iconify/utils/lib/svg/build';
import type { IconCustomisations } from '../misc/customisations';

export function renderHTML(
	icon: FullIconifyIcon,
	customisations: IconCustomisations,
	className?: string
): string {
	const buildResult = iconToSVG(icon, customisations);

	// Style
	const style: string[] = [];
	if (customisations.inline) {
		style.push('vertical-align: -0.125em');
	}
	/*
	if (customisations.color !== '') {
		style.push('color: ' + customisations.color);
	}
	*/

	const customAttributes: Record<string, string> = {};
	if (typeof className === 'string' && className !== '') {
		customAttributes['class'] = className;
	}
	if (style.length) {
		customAttributes['style'] = style.join('; ') + ';';
	}

	// Generate SVG attributes
	const attributes: Record<string, string> = {
		// Default SVG stuff
		'xmlns': 'http://www.w3.org/2000/svg',
		'xmlns:xlink': 'http://www.w3.org/1999/xlink',
		'aria-hidden': 'true',
		'role': 'img',
		// Custom attributes
		...customAttributes,
		// Attributes from build result
		...buildResult.attributes,
	};

	// Replace color inside SVG
	let body = buildResult.body;
	if (customisations.color !== '') {
		body = body.replace(/currentColor/g, customisations.color);
	}

	// Remove unused xlink namespace
	if (body.indexOf('xlink:') === -1) {
		delete attributes['xmlns:xlink'];
	}

	// Generate HTML
	return (
		'<svg ' +
		Object.keys(attributes)
			.map((key) => {
				// There should be no quotes in content, so nothing to encode
				return key + '="' + attributes[key] + '"';
			})
			.join(' ') +
		'>' +
		body +
		'</svg>'
	);
}
