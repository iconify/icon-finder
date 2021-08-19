import { Iconify } from '../../iconify';
import type { IconCustomisations } from '../../misc/customisations';
import { Icon, iconToString } from '../../misc/icon';
import { renderHTML } from '../html';
import type { CodeSampleAPIConfig, CodeSampleMode } from '../types';
import type { CodeOutput } from './types';

/**
 * Code output for API component
 */
export function svgParser(
	lang: CodeSampleMode,
	icon: Icon,
	customisations: IconCustomisations,
	providerConfig: CodeSampleAPIConfig
): CodeOutput | null {
	if (!providerConfig.raw) {
		return null;
	}

	const iconName = iconToString(icon);
	const data = Iconify.getIcon?.(iconName);
	if (!data) {
		return null;
	}

	let str = renderHTML(data, customisations);
	switch (lang) {
		case 'svg-box':
			// Add empty rectangle before shapes
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			str = str.replace(
				'>',
				'><rect x="' +
					data.left +
					'" y="' +
					data.top +
					'" width="' +
					data.width +
					'" height="' +
					data.height +
					'" fill="none" stroke="none" />'
			);
			break;

		case 'svg-uri': {
			// Remove unused attributes
			const parts = str.split('>');
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			let firstTag = parts.shift()!;
			['aria-hidden', 'focusable', 'role', 'class', 'style'].forEach(
				(attr) => {
					firstTag = firstTag.replace(
						new RegExp('\\s' + attr + '="[^"]*"'),
						''
					);
				}
			);
			parts.unshift(firstTag);
			str = parts.join('>');

			// Encode
			str = "url('data:image/svg+xml," + encodeURIComponent(str) + "')";
			break;
		}
	}

	const result: CodeOutput = {
		raw: [str],
		isAPI: false,
	};
	return result;
}
