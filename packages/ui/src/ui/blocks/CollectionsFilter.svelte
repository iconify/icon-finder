<script>
	import Block from '../Block.svelte';
	import Input from '../forms/Input.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {FiltersBlock | null} */

	const phrases = registry.phrases.search; /** @type {UITranslation.search} */
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
