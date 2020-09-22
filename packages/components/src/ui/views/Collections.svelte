<script>
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionsFilterBlock from '../blocks/CollectionsFilter.svelte';
	import CollectionsListBlock from '../blocks/CollectionsList.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {CollectionsViewBlocks | null} */
	export let blocks;
	/** @type {PartialRoute} */
	export let route;

	/** @type {string} */
	let provider;
	$: {
		provider =
			route.params && route.params.provider ? route.params.provider : '';
	}
</script>

<div class="iif-view iif-view--collections">
	<div class="iif-collections-header">
		{#if blocks.categories}
			<FiltersBlock
				{registry}
				name="categories"
				block={blocks.categories} />
		{/if}
		<CollectionsFilterBlock
			{registry}
			name="filter"
			block={blocks.filter} />
	</div>
	<CollectionsListBlock
		{registry}
		{provider}
		name="collections"
		block={blocks.collections} />
</div>
