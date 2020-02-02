<script>
	import Input from '../forms/Input.svelte';
	import Block from '../Block.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {CollectionsListBlock} */

	// Phrases
	const phrases = registry.phrases; /** @type {UITranslation} */

	// Submit form
	function changeValue(value) {
		registry.router.action(name, value.trim().toLowerCase());
	}
</script>

<Block type="search" {name} extra="search-form">
	<Input
		type="text"
		value={block.keyword}
		onInput={changeValue}
		placeholder={phrases.search.placeholder}
		icon="search" />
	<button class="iif-form-button iif-form-button--primary" focusable="false">
		{phrases.search.button}
	</button>
</Block>
