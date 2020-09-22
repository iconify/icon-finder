<script>
	import Iconify from '@iconify/iconify';
	import { getDimensions } from '../../../../../misc/icon-size';
	import Block from '../Block.svelte';
	import SizeInput from '../SizeInput.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {IconifyIcon} */
	export let iconData;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {function} */
	export let customise;

	// @iconify-replacement: 'customiseWidth = true'
	const customiseWidth = true;
	// @iconify-replacement: 'customiseHeight = true'
	const customiseHeight = true;

	// @iconify-replacement: 'defaultWidth = '''
	const defaultWidth = '';
	// @iconify-replacement: 'defaultHeight = '''
	const defaultHeight = '';

	const type =
		customiseWidth && customiseHeight
			? 'size'
			: customiseWidth
			? 'width'
			: 'height';
	const list =
		customiseWidth && customiseHeight
			? ['width', 'height']
			: [customiseWidth ? 'width' : 'height'];

	// Check if icon is rotated (for width/height calculations)
	/** @type {boolean} */
	let rotated;
	$: {
		rotated =
			iconData.width !== iconData.height &&
			iconCustomisations.rotate &&
			iconCustomisations.rotate % 2 === 1;
	}

	// Width / height ratio
	/** @type {number} */
	let ratio;
	$: {
		ratio = iconData.width / iconData.height;
	}

	// Get placeholders
	/** @type {Record<string, string>} */
	let placeholders;
	$: {
		if (type === 'size') {
			if (iconCustomisations.width || iconCustomisations.height) {
				// Calculate placeholders based on custom size
				placeholders = getDimensions(
					iconCustomisations.width,
					iconCustomisations.height,
					ratio,
					rotated
				);
			} else if (defaultWidth || defaultHeight) {
				// Calculate placeholders based on default size
				placeholders = getDimensions(
					defaultWidth,
					defaultHeight,
					ratio,
					rotated
				);
			} else {
				// Calculate placeholders based on icon size
				placeholders = getDimensions(
					iconData.width,
					iconData.height,
					ratio,
					rotated
				);
			}
		} else {
			// Get placeholder
			const defaultValue = customiseWidth ? defaultWidth : defaultHeight;
			let value = defaultValue ? defaultValue : iconData[type];
			if (rotated) {
				// Flip width/height
				const ratio = customiseWidth
					? iconData.height / iconData.width
					: iconData.width / iconData.height;
				value = Iconify._internal.calculateSize(value, ratio);
			}
			placeholders = {
				[type]: value,
			};
		}
	}
</script>

<Block {type} {registry}>
	{#each list as type, i (type)}
		<SizeInput
			{registry}
			{type}
			value={iconCustomisations[type]}
			iconSize={iconData[type]}
			placeholder={placeholders[type]}
			{customise} />
	{/each}
</Block>
