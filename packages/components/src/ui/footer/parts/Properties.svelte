<script context="module">
	// Constants toggled by compiler, allowing minifier to exclude blocks of
	// code `if (false) { ... removed code ... }`, reducing bundle size

	// @iconify-replacement: 'showPropsTitle = false'
	const showPropsTitle = false;

	// @iconify-replacement: 'customiseColor = true'
	const customiseColor = true;
	// @iconify-replacement: 'customiseSize = true'
	const customiseSize = true;
	// @iconify-replacement: 'customiseRotate = true'
	const customiseRotate = true;
	// @iconify-replacement: 'customiseFlip = true'
	const customiseFlip = true;
</script>

<script>
	import Iconify from '@iconify/iconify';

	// Important: for dynamic component replacements to work, component names below
	// must match directory name with capitalized first letter!

	// @iconify-replacement: '/props/color/Color.svelte'
	import ColorBlock from './props/color/Color.svelte';
	// @iconify-replacement: '/props/size/Size.svelte'
	import SizeBlock from './props/size/Size.svelte';
	// @iconify-replacement: '/props/rotate/Rotate.svelte'
	import RotateBlock from './props/rotate/Rotate.svelte';
	// @iconify-replacement: '/props/flip/Flip.svelte'
	import FlipBlock from './props/flip/Flip.svelte';

	export let registry; /** @type {Registry} */
	export let iconName; /** @type {string} */
	export let customise; /** @type {function} */
	export let iconCustomisations; /** @type {IconCustomisations} */

	// Title
	const title = showPropsTitle ? registry.phrases.footerBlocks.title : '';

	// Get icon data
	let iconData;
	$: {
		iconData = Iconify.getIcon(iconName);
	}
</script>

{#if iconData}
	{#if showPropsTitle && title}
		<p class="iif-footer-options-block-title">{title}</p>
	{/if}
	<div class="iif-footer-options-blocks">
		{#if customiseColor}
			<ColorBlock
				{registry}
				{iconData}
				value={iconCustomisations.color}
				{customise} />
		{/if}
		{#if customiseSize}
			<SizeBlock {registry} {iconData} {iconCustomisations} {customise} />
		{/if}
		{#if customiseFlip}
			<FlipBlock {registry} {iconData} {iconCustomisations} {customise} />
		{/if}
		{#if customiseRotate}
			<RotateBlock
				{registry}
				{iconData}
				value={iconCustomisations.rotate}
				{customise} />
		{/if}
	</div>
{/if}
