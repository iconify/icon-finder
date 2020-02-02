<script>
	import Block from '../Block.svelte';
	import Category from './collections-list/Category.svelte';
	import Error from './errors/ContentError.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {CollectionsListBlock} */

	const phrases = registry.phrases; /** @type {UITranslation} */

	function onClick(prefix) {
		registry.router.action(name, prefix);
	}
</script>

<Block type="collections">
	{#each Object.entries(block.collections) as [category, items], i (category)}
		<Category
			{registry}
			{phrases}
			{onClick}
			showCategories={block.showCategories}
			{category}
			{items} />
	{:else}
		<Error error={phrases.errors.noCollections} />
	{/each}
</Block>
