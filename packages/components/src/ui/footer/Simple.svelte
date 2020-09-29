<script context="module">
	// @iconify-replacement: 'canShowIconProperties = true'
	const canShowIconProperties = true;

	// @iconify-replacement: 'canShowIconCode = true'
	const canShowIconCode = true;
</script>

<script>
	import Block from '../Block.svelte';
	// @iconify-replacement: '/parts/name/Simple.svelte'
	import IconName from './parts/name/Simple.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';
	// @iconify-replacement: './parts/Properties.svelte'
	import PropertiesContainer from './parts/Properties.svelte';
	// @iconify-replacement: './parts/Code.svelte'
	import CodeContainer from './parts/Code.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {Icon} */
	export let selectedIcon;
	/** @type {string} */
	export let iconName;
	/** @type {function} */
	export let customise;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {PartialRoute} */
	export let route;
	/** @type {object} */
	export let footerOptions;
</script>

{#if loaded | footerOptions.showButtons}
	<Block type="footer">
		<IconName {registry} {iconName} {loaded} {selectedIcon} {route} />
		{#if canShowIconProperties && loaded}
			<PropertiesContainer
				{registry}
				{iconName}
				{customise}
				{iconCustomisations} />
		{/if}
		{#if canShowIconCode && loaded}
			<CodeContainer {registry} {iconName} {iconCustomisations} {route} />
		{/if}
		{#if footerOptions.showButtons}
			<ButtonsContainer {registry} {loaded} {iconName} {footerOptions} />
		{/if}
	</Block>
{/if}
