<script>
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionsFilterBlock from '../blocks/CollectionsFilter.svelte';
	import CollectionsListBlock from '../blocks/CollectionsList.svelte';

	export let registry; /** @type {Registry} */
	export let blocks; /** @type {CollectionsViewBlocks | null} */
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
		name="collections"
		block={blocks.collections} />
</div>
