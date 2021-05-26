import 'mocha';
import { expect } from 'chai';
import { renderHTML } from '../../lib/code-samples/html';
import { fullIcon, FullIconifyIcon } from '@iconify/utils/lib/icon';
import {
	mergeCustomisations,
	emptyCustomisations,
} from '../../lib/misc/customisations';

describe('Testing Iconify replacements for code samples', () => {
	it('renderHTML()', () => {
		const icon: FullIconifyIcon = fullIcon({
			body:
				'<g fill="currentColor"><path stroke="currentColor" fill="none" d="" /></g>',
			width: 24,
			height: 24,
		});

		// Test rendering it
		expect(renderHTML(icon, emptyCustomisations)).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="currentColor"><path stroke="currentColor" fill="none" d="" /></g></svg>'
		);

		// Inline and class
		expect(
			renderHTML(
				icon,
				mergeCustomisations(emptyCustomisations, {
					inline: true,
				}),
				'iconify iconify--test'
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--test" style="vertical-align: -0.125em;" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g fill="currentColor"><path stroke="currentColor" fill="none" d="" /></g></svg>'
		);

		// Custom size and alignment
		expect(
			renderHTML(
				icon,
				mergeCustomisations(emptyCustomisations, {
					height: 'auto',
					width: 32,
					hAlign: 'left',
				})
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="32" height="24" preserveAspectRatio="xMinYMid meet" viewBox="0 0 24 24"><g fill="currentColor"><path stroke="currentColor" fill="none" d="" /></g></svg>'
		);

		// Rotate and color
		expect(
			renderHTML(
				icon,
				mergeCustomisations(emptyCustomisations, {
					rotate: 2,
					color: '#f00',
				})
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><g transform="rotate(180 12 12)"><g fill="#f00"><path stroke="#f00" fill="none" d="" /></g></g></svg>'
		);
	});
});
