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
	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */
	export let customisations; /** @type {PartialIconCustomisations} */
	export let hidden; /** @type {boolean} */

	// RouterEvent
	// export let viewChanged; /** @type {boolean} */
	// export let error; /** @type {string} */
	export let route; /** @type {PartialRoute} */
	// export let blocks; /** @type {ViewBlocks | null} */
</script>

{#if hidden !== true}
	<Wrapper>
		<Navigation {registry} {route} />
		<Content {...$$props} />
		<Footer {registry} {selectedIcon} {route} {customisations} />
	</Wrapper>
{/if}
