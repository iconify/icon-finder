import 'mocha';
import { expect } from 'chai';
import Iconify from '@iconify/iconify';
import { renderPlaceholder } from '../../lib/iconify/placeholder';
import { renderHTML } from '../../lib/iconify/html';

describe('Testing Iconify replacements for SSR', () => {
	it('renderPlaceholder()', () => {
		// Simple placeholder
		expect(renderPlaceholder('mdi:home', {})).to.be.equal(
			'<span class="iconify" data-icon="mdi:home"></span>'
		);

		// Inline
		expect(
			renderPlaceholder('mdi:home', {
				inline: true,
			})
		).to.be.equal(
			'<span class="iconify" data-icon="mdi:home" data-inline="true"></span>'
		);

		// Transformations
		expect(
			renderPlaceholder('mdi:home', {
				rotate: 0,
				hFlip: true,
			})
		).to.be.equal(
			'<span class="iconify" data-icon="mdi:home" data-flip="horizontal"></span>'
		);

		expect(
			renderPlaceholder('mdi:home', {
				rotate: 2,
				vFlip: true,
			})
		).to.be.equal(
			'<span class="iconify" data-icon="mdi:home" data-rotate="2" data-flip="vertical"></span>'
		);

		expect(
			renderPlaceholder('mdi:home', {
				vFlip: true,
				hFlip: true,
				width: 0,
			})
		).to.be.equal(
			'<span class="iconify" data-icon="mdi:home" data-flip="vertical,horizontal"></span>'
		);

		// Dimensions
		expect(
			renderPlaceholder('mdi:home', {
				height: 24,
				width: '1em',
			})
		).to.be.equal(
			'<span class="iconify" data-icon="mdi:home" data-height="24" data-width="1em"></span>'
		);

		// Ignored values
		expect(
			renderPlaceholder('mdi:home', {
				inline: false,
				hFlip: false,
				vFlip: false,
				rotate: 0,
				width: 0,
				height: '',
			})
		).to.be.equal('<span class="iconify" data-icon="mdi:home"></span>');
	});

	it('renderHTML()', () => {
		// Add dummy icon to storage
		const name = 'foo:bar';
		Iconify.addIcon(name, {
			body: '<g />',
			width: 24,
			height: 24,
		});

		// Test rendering it
		expect(renderHTML(name, {}, Iconify.renderIcon)).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--foo" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="foo:bar"><g /></svg>'
		);

		// Inline
		expect(
			renderHTML(
				name,
				{
					inline: true,
				},
				Iconify.renderIcon
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--foo iconify-inline" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="foo:bar" style="vertical-align: -0.125em;"><g /></svg>'
		);

		// Custom size
		expect(
			renderHTML(
				name,
				{
					height: 'auto',
				},
				Iconify.renderIcon
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--foo" width="24" height="24" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="foo:bar"><g /></svg>'
		);

		// Rotate
		expect(
			renderHTML(
				name,
				{
					rotate: 2,
				},
				Iconify.renderIcon
			)
		).to.be.equal(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--foo" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" data-icon="foo:bar"><g transform="rotate(180 12 12)"><g /></g></svg>'
		);
	});
});
