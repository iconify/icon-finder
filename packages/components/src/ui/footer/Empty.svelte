<script>
	import Block from '../Block.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';

	/** @type {Registry} */
	// export let registry;
	/** @type {boolean} */
	// export let loaded;
	/** @type {Icon} */
	// export let selectedIcon;
	/** @type {string} */
	// export let iconName;
	/** @type {IconCustomisations} */
	// export let iconCustomisations;
	/** @type {PartialRoute} */
	// export let route;
	/** @type {object} */
	export let footerOptions;
</script>

{#if footerOptions.showButtons}
	<Block type="footer">
		<ButtonsContainer {...$$props} />
	</Block>
{/if}
