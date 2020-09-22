<script>
	// @iconify-replacement: '/wrapper/Default.svelte'
	import Wrapper from './wrapper/Default.svelte';
	// @iconify-replacement: '/navigation/Empty.svelte'
	import Navigation from './navigation/Empty.svelte';
	import Footer from './Footer.svelte';
	import Content from './Content.svelte';

	/**
	 * Global exports
	 */
	/** @type {Registry} */
	export let registry;
	/** @type {Icon | null} */
	export let selectedIcon;
	/** @type {PartialIconCustomisations} */
	export let customisations;
	/** @type {boolean} */
	export let hidden;

	// RouterEvent
	/** @type {boolean} */
	// export let viewChanged;
	/** @type {string} */
	// export let error;
	/** @type {PartialRoute} */
	export let route;
	/** @type {ViewBlocks | null} */
	// export let blocks;
</script>

{#if hidden !== true}
	<Wrapper>
		<Navigation {registry} {route} />
		<Content {...$$props} />
		<Footer {registry} {selectedIcon} {route} {customisations} />
	</Wrapper>
{/if}
