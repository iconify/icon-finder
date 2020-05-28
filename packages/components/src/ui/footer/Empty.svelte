<script>
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	// export let registry; /** @type {Registry} */
	// export let loaded; /** @type {boolean} */
	// export let selectedIcon; /** @type {Icon} */
	// export let iconName; /** @type {string} */
	// export let iconCustomisations; /** @type {IconCustomisations} */
	// export let route; /** @type {PartialRoute} */
	export let footerOptions; /** @type {object} */
</script>

{#if footerOptions.showButtons}
	<Block type="footer">
		<ButtonsContainer {...$$props} />
	</Block>
{/if}
