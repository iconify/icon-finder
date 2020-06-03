<script>
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionsFilterBlock from '../blocks/CollectionsFilter.svelte';
	import CollectionsListBlock from '../blocks/CollectionsList.svelte';

	export let registry; /** @type {Registry} */
	export let blocks; /** @type {CollectionsViewBlocks | null} */
	export let route; /** @type {PartialRoute} */

	let provider;
	$: {
		provider =
			route.params && route.params.provider ? route.params.provider : '';
	}
</script>

<div class="iif-view iif-view--collections">
	<div class="iif-collections-header">
		{#if blocks.categories}
			<FiltersBlock {registry} name="categories" block={blocks.categories} />
		{/if}
		<CollectionsFilterBlock {registry} name="filter" block={blocks.filter} />
	</div>
	<CollectionsListBlock
		{registry}
		{provider}
		name="collections"
		block={blocks.collections} />
</div>
