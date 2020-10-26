<script>
	import Block from '../Block.svelte';
	import Input from '../forms/Input.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let name;
	/** @type {CollectionsFilterBlock} */
	export let block;

	/** @type {UITranslation.search} */
	const phrases = registry.phrases.search;
	/** @type {string} */
	let value = block.keyword;

	$: {
		if (value !== block.keyword) {
			registry.router.action(name, value);
		}
	}

	const placeholder =
		phrases.placeholder.collections === void 0
			? phrases.defaultPlaceholder
			: phrases.placeholder.collections;
</script>

<Block type="filter">
	<Input type="text" bind:value icon="search" {placeholder} />
</Block>
