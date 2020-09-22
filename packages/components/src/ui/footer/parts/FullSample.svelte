<script>
	import Iconify from '@iconify/iconify';
	import { getDimensions } from '../../../misc/icon-size';
	import Icon from '../../misc/Icon.svelte';

	/** @type {Registry} */
	// export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {string} */
	export let iconName;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {object} */
	export let footerOptions;

	const divisions = [2.5, 3, 3.5];

	// @iconify-replacement: 'defaultColor = '''
	const defaultColor = '';

	// @iconify-replacement: 'defaultWidth = '''
	const defaultWidth = '';
	// @iconify-replacement: 'defaultHeight = '''
	const defaultHeight = '';

	// Get maximum width/height from options
	/** @type {number} */
	const maxWidth = footerOptions.fullSample.width;
	/** @type {number} */
	const maxHeight = footerOptions.fullSample.height;

	const minWidth = Math.floor(maxWidth / 2);
	const minHeight = Math.floor(maxHeight / 2);

	// Get icon data
	/** @type {IconifyIcon | null} */
	let iconData;
	$: {
		iconData = loaded ? Iconify.getIcon(iconName) : null;
	}

	// Check if icon is rotated (for width/height calculations)
	/** @type {boolean} */
	let rotated;
	$: {
		rotated =
			loaded &&
			iconData.width !== iconData.height &&
			iconCustomisations.rotate &&
			iconCustomisations.rotate % 2 === 1;
	}

	// Width / height ratio
	/** @type {number} */
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
	/** @type {string} */
	let style;
	$: {
		style = '';
		if (iconCustomisations.color) {
			style += 'color: ' + iconCustomisations.color + ';';
		} else if (defaultColor) {
			style += 'color: ' + defaultColor + ';';
		}
		if (loaded && !iconCustomisations.width && !iconCustomisations.height) {
			// Calculate size
			let size;

			if (defaultWidth || defaultHeight) {
				size = getDimensions(
					defaultWidth,
					defaultHeight,
					ratio,
					rotated
				);
			} else {
				size = getDimensions(
					iconData.width,
					iconData.height,
					ratio,
					rotated
				);
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
			['hFlip', 'vFlip', 'rotate'].forEach((prop) => {
				if (iconCustomisations[prop]) {
					props[prop] = iconCustomisations[prop];
				}
			});
			let size;
			if (iconCustomisations.width || iconCustomisations.height) {
				size = getDimensions(
					iconCustomisations.width,
					iconCustomisations.height,
					ratio,
					rotated
				);
			} else if (defaultWidth || defaultHeight) {
				size = getDimensions(
					defaultWidth,
					defaultHeight,
					ratio,
					rotated
				);
			}
			if (size !== void 0) {
				scaleSample(size, false);
				props['width'] = size.width;
				props['height'] = size.height;
			}
		}
	}
</script>

{#if loaded}
	<div class="iif-footer-sample iif-footer-sample--loaded" {style}>
		<Icon icon={iconName} {props} />
	</div>
{:else}
	<div class="iif-footer-sample iif-footer-sample--empty" />
{/if}
