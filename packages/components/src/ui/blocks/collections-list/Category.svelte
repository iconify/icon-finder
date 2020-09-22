<script>
	import Item from './Item.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {UITranslation} */
	export let phrases;
	/** @type {boolean} */
	export let showCategories;
	/** @type {string} */
	export let category;
	/** @type {Record<string, CollectionInfo>} */
	export let items;
	/** @type {string} */
	export let provider;
	/** @type {function} */
	export let onClick;
</script>

<div class="iif-collections-list-category">
	{#if showCategories}
		<div class="iif-collections-list-title">{category}</div>
	{/if}
	<ul class="iif-collections-list-items">
		{#each Object.entries(items) as [prefix, info], i (prefix)}
			<Item {registry} {phrases} {provider} {prefix} {info} {onClick} />
		{/each}
	</ul>
</div>
