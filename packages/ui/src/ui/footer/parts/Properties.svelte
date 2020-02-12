<script context="module">
	// Constants toggled by compiler, allowing minifier to exclude blocks of
	// code `if (false) { ... removed code ... }`, reducing bundle size

	// @iconify-replacement: 'canShowColorProp = true'
	const canShowColorProp = true;
	// @iconify-replacement: 'canShowSizeProp = true'
	const canShowSizeProp = true;
	// @iconify-replacement: 'canShowRotateProp = true'
	const canShowRotateProp = true;
	// @iconify-replacement: 'canShowFlipProp = true'
	const canShowFlipProp = true;
</script>

<script>
	import Iconify from '@iconify/iconify';
	// @iconify-replacement: '/props/Color.svelte'
	import ColorBlock from './props/Color.svelte';
	// @iconify-replacement: '/props/Size.svelte'
	import SizeBlock from './props/Size.svelte';
	// @iconify-replacement: '/props/Rotate.svelte'
	import RotateBlock from './props/Rotate.svelte';
	// @iconify-replacement: '/props/Flip.svelte'
	import FlipBlock from './props/Flip.svelte';

	export let registry; /** @type {Registry} */
	export let iconName; /** @type {string} */
	export let iconProps; /** @type {PartialIconProperties} */

	const defaultProps = registry.defaultProps;

	// Get icon data
	let iconData;
	$: {
		iconData = Iconify.getIcon(iconName);
	}
</script>

{#if iconData}
	<div class="iif-footer-options-blocks">
		{#if canShowColorProp && defaultProps.color}
			<ColorBlock {registry} {iconData} value={iconProps.color} />
		{/if}
		{#if canShowSizeProp && (defaultProps.width || defaultProps.height)}
			<SizeBlock {registry} {iconData} {iconProps} />
		{/if}
		{#if canShowRotateProp && defaultProps.rotate}
			<RotateBlock {registry} {iconData} value={iconProps.rotate} />
		{/if}
		{#if canShowFlipProp && defaultProps.hFlip}
			<FlipBlock {registry} {iconData} {iconProps} />
		{/if}
	</div>
{/if}
