<script>
	import {
		calculateDimension,
		getDimensions,
	} from '../../../../misc/icon-size';
	import Block from './Block.svelte';
	import SizeInput from './SizeInput.svelte';

	export let registry; /** @type {Registry} */
	export let iconData; /** @type {IconifyIcon} */
	export let iconProps; /** @type {PartialIconProperties} */

	const defaultProps = registry.defaultProps;
	const type =
		defaultProps.width && defaultProps.height
			? 'size'
			: defaultProps.width
			? 'width'
			: 'height';
	const list =
		defaultProps.width && defaultProps.height
			? ['width', 'height']
			: [defaultProps.width ? 'width' : 'height'];

	// Check if icon is rotated (for width/height calculations)
	let rotated;
	$: {
		rotated =
			iconData.width !== iconData.height &&
			iconProps.rotate &&
			iconProps.rotate % 2 === 1;
	}

	// Width / height ratio
	let ratio;
	$: {
		ratio = iconData.width / iconData.height;
	}

	// Get placeholders
	let placeholders;
	$: {
		if (type === 'size') {
			if (iconProps.width || iconProps.height) {
				placeholders = getDimensions(
					iconProps.width,
					iconProps.height,
					ratio,
					rotated
				);
			} else if (
				defaultProps.width.defaultValue ||
				defaultProps.height.defaultValue
			) {
				placeholders = getDimensions(
					defaultProps.width.defaultValue,
					defaultProps.height.defaultValue,
					ratio,
					rotated
				);
			} else {
				placeholders = getDimensions(
					iconData.width,
					iconData.height,
					ratio,
					rotated
				);
			}
		} else {
			// Get placeholder
			const defaultValue = defaultProps[type].defaultValue;
			let value = defaultValue ? defaultValue : iconData[type];
			if (rotated) {
				// Flip width/height
				const ratio =
					type === 'width'
						? iconData.height / iconData.width
						: iconData.width / iconData.height;
				value = calculateDimension(value, ratio);
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
			value={iconProps[type]}
			iconSize={iconData[type]}
			placeholder={placeholders[type]} />
	{/each}
</Block>
