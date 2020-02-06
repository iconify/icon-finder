<script>
	import Block from '../Block.svelte';
	// @iconify-replacement: '/parts/IconName.svelte'
	import IconName from './parts/IconName.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	// export let selectedIcon; /** @type {Icon} */
	export let iconName; /** @type {string} */
	// export let route; /** @type {PartialRoute} */
	export let footerOptions; /** @type {object} */
</script>

{#if loaded | footerOptions.showButtons}
	<Block type="footer">
		<IconName {registry} {iconName} {loaded} />
		<ButtonsContainer {registry} {loaded} {iconName} {footerOptions} />
	</Block>
{/if}
