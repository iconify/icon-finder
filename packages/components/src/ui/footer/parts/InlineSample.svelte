<script>
	import Iconify from '@iconify/iconify';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {string} */
	export let iconName;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {object} */
	export let footerOptions;

	const phrases = registry.phrases.footer.inlineSample;

	// Get maximum width/height from options
	/** @type {number} */
	const maxWidth = footerOptions.fullSample.width;
	/** @type {number} */
	const maxHeight = footerOptions.fullSample.height;

	let html;
	let style;
	$: {
		if (loaded) {
			const props = {};
			style = '';
			Object.keys(iconCustomisations).forEach((attr) => {
				const value = iconCustomisations[attr];
				if (value !== '' && value !== 0 && value !== false) {
					if (attr === 'color') {
						style = 'color: ' + value;
					} else {
						props[attr] = value;
					}
				}
			});

			// Adjust width and height
			if (props.width || props.height) {
				const rotated = !!(iconCustomisations.rotated % 2);

				let key = rotated ? 'height' : 'width';
				if (props[key] && props[key] > maxWidth) {
					props[key] = maxWidth;
				}
				key = !rotated ? 'height' : 'width';
				if (props[key] && props[key] > maxHeight) {
					props[key] = maxHeight;
				}
			}

			html = Iconify.renderHTML(iconName, props);
		}
	}
</script>

{#if loaded}
	<div
		class="iif-footer-sample iif-footer-sample--inline iif-footer-sample--loaded">
		<p>
			{phrases.before}
			<span {style}>{@html html}</span>
			{phrases.after}
		</p>
	</div>
{:else}
	<div class="iif-footer-sample iif-footer-sample--empty" />
{/if}
