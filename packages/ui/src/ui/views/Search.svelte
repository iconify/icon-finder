<script>
	import FiltersBlock from '../blocks/Filters.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';

	export let registry; /** @type {Registry} */
	export let route; /** @type {PartialRoute} */
	export let selectedIcon; /** @type {Icon | null} */
	export let blocks; /** @type {CollectionViewBlocks | null} */

	let keyword; /** @type {string} */
	$: {
		keyword = route.params.keyword;
	}
</script>

<div class="iif-view iif-view--search">
	{#if blocks.collections}
		<FiltersBlock {registry} name="collections" block={blocks.collections} />
	{/if}

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
