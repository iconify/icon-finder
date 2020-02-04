<script>
	import Input from '../forms/Input.svelte';
	import Block from '../Block.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {CollectionsListBlock} */
	export let info = null; /** @type {CollectionInfo | null} */
	export let customType = ''; /** @type {string} */

	// Phrases
	const phrases = registry.phrases.search; /** @type {UITranslation.search} */

	// Get placeholder
	let placeholder;
	$: {
		if (customType !== '' && phrases.placeholder[customType] !== void 0) {
			placeholder = phrases.placeholder[customType];
		} else if (info && info.name && phrases.placeholder.collection !== void 0) {
			placeholder = phrases.placeholder.collection.replace('{name}', info.name);
		} else {
			placeholder = phrases.defaultPlaceholder;
		}
	}

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
		{placeholder}
		icon="search"
		autofocus={true} />
	<button class="iif-form-button iif-form-button--primary" focusable="false">
		{phrases.button}
	</button>
</Block>
