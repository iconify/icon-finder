<script>
	import Item from './Item.svelte';

	export let registry; /** @type {Registry} */
	export let phrases; /** @type {UITranslation} */
	export let showCategories; /** @type {boolean} */
	export let category; /** @type {string} */
	export let items; /** @type {Record<string, CollectionInfo>} */
	export let provider; /** @type {string} */
	export let onClick; /** @type {function} */
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
