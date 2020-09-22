<script>
	import Block from '../Block.svelte';
	import Category from './collections-list/Category.svelte';
	import Error from './errors/ContentError.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let name;
	/** @type {CollectionsListBlock} */
	export let block;
	/** @type {string} */
	export let provider;

	/** @type {UITranslation} */
	const phrases = registry.phrases;

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
			{provider}
			{items} />
	{:else}
		<Error error={phrases.errors.noCollections} />
	{/each}
</Block>
