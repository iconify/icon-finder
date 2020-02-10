<script>
	import Iconify from '@iconify/iconify';
	import ColorBlock from './props/Color.svelte';
	import SizeBlock from './props/Size.svelte';
	import RotateBlock from './props/Rotate.svelte';
	import FlipBlock from './props/Flip.svelte';

	export let registry; /** @type {Registry} */
	// export let selectedIcon; /** @type {Icon} */
	export let iconName; /** @type {string} */
	export let iconProps; /** @type {PartialIconProperties} */
	// export let route; /** @type {PartialRoute} */
	// export let footerOptions; /** @type {object} */

	const defaultProps = registry.defaultProps;

	// Get icon data
	let iconData;
	$: {
		iconData = Iconify.getIcon(iconName);
	}
</script>

{#if iconData}
	<div class="iif-footer-options-blocks">
		{#if defaultProps.color}
			<ColorBlock {registry} {iconData} value={iconProps.color} />
		{/if}
		{#if defaultProps.width || defaultProps.height}
			<SizeBlock {registry} {iconData} {iconProps} />
		{/if}
		{#if defaultProps.rotate}
			<RotateBlock {registry} {iconData} value={iconProps.rotate} />
		{/if}
		{#if defaultProps.hFlip}
			<FlipBlock {registry} {iconData} {iconProps} />
		{/if}
	</div>
{/if}
