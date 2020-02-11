<script>
	import Iconify from '@iconify/iconify';
	import { getDimensions } from '../../../misc/icon-size';
	import Icon from '../../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let iconName; /** @type {string} */
	export let iconProps; /** @type {PartialIconProperties} */
	export let footerOptions; /** @type {object} */

	const divisions = [2.5, 3, 3.5];
	const defaultProps = registry.defaultProps;

	// Get maximum width/height from options
	const maxWidth = footerOptions.maxFullSampleWidth
		? footerOptions.maxFullSampleWidth
		: 200;
	const maxHeight = footerOptions.maxFullSampleHeight
		? footerOptions.maxFullSampleHeight
		: 300;

	const minWidth = Math.floor(maxWidth / 2);
	const minHeight = Math.floor(maxHeight / 2);

	// Get icon data
	let iconData;
	$: {
		iconData = loaded ? Iconify.getIcon(iconName) : null;
	}

	// Check if icon is rotated (for width/height calculations)
	let rotated;
	$: {
		rotated =
			loaded &&
			iconData.width !== iconData.height &&
			iconProps.rotate &&
			iconProps.rotate % 2 === 1;
	}

	// Width / height ratio
	let ratio;
	$: {
		ratio = loaded ? iconData.width / iconData.height : 1;
	}

	// Scale sample
	function scaleSample(size, canScaleUp) {
		// Scale
		while (size.width > maxWidth || size.height > maxHeight) {
			// Attempt to divide by 2
			let newWidth = size.width / 2;
			let newHeight = size.height / 2;

			if (
				Math.round(newWidth) !== newWidth ||
				Math.round(newHeight) !== newHeight
			) {
				// Try to divide by a different number
				for (let i = 0; i < divisions.length; i++) {
					let div = divisions[i];
					let newWidth2 = size.width / div;
					let newHeight2 = size.height / div;
					if (
						Math.round(newWidth2) === newWidth2 &&
						Math.round(newHeight2) === newHeight2
					) {
						newWidth = newWidth2;
						newHeight = newHeight2;
						break;
					}
				}
			}

			size.width = newWidth;
			size.height = newHeight;
		}

		if (canScaleUp) {
			while (size.width < minWidth && size.height < minHeight) {
				size.width *= 2;
				size.height *= 2;
			}
		}
	}

	// Calculate style
	let style;
	$: {
		style = '';
		if (iconProps.color) {
			style += 'color: ' + iconProps.color + ';';
		}
		if (loaded && !iconProps.width && !iconProps.height) {
			// Calculate size
			let size;

			if (defaultProps.width.defaultValue || defaultProps.height.defaultValue) {
				size = getDimensions(
					defaultProps.width.defaultValue,
					defaultProps.height.defaultValue,
					ratio,
					rotated
				);
			} else {
				size = getDimensions(iconData.width, iconData.height, ratio, rotated);
			}

			// Scale
			scaleSample(size, true);
			style += 'font-size: ' + size.height + 'px;';
		}
	}

	let props;
	$: {
		if (loaded) {
			props = {};
			if (iconProps.hFlip || iconProps.vFlip) {
				props['data-flip'] = iconProps.hFlip
					? iconProps.vFlip
						? 'horizontal,vertical'
						: 'horizontal'
					: 'vertical';
			}
			if (iconProps.rotate) {
				props['data-rotate'] = iconProps.rotate;
			}
			if (iconProps.width || iconProps.height) {
				let size = getDimensions(
					iconProps.width,
					iconProps.height,
					ratio,
					rotated
				);
				scaleSample(size, false);
				props['data-width'] = size.width;
				props['data-height'] = size.height;
			}
		}
	}
</script>

{#if loaded}
	<div class="iif-footer-sample iif-footer-sample--loaded" {style}>
		<Icon icon={iconName} height="1em" {props} />
	</div>
{:else}
	<div class="iif-footer-sample iif-footer-sample--empty" />
{/if}
