<script>
	import Block from '../Block.svelte';
	import Input from '../forms/Input.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {FiltersBlock | null} */

	const phrases = registry.phrases; /** @type {UITranslation} */
	let value = block.keyword;

	$: {
		if (value !== block.keyword) {
			registry.router.action(name, value);
		}
	}
</script>

<Block type="filter">
	<Input
		type="text"
		bind:value
		icon="search"
		placeholder={phrases.search.collectionsPlaceholder} />

</Block>
