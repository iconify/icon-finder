<script>
	import Input from '../forms/Input.svelte';
	import Block from '../Block.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let name;
	/** @type {CollectionsListBlock} */
	export let block;
	/** @type {CollectionInfo | null} */
	export let info = null;
	/** @type {string} */
	export let customType = '';

	// @iconify-replacement: 'canFocusSearch = true'
	const canFocusSearch = true;

	// Phrases
	/** @type {UITranslation.search} */
	const phrases = registry.phrases.search;

	// Get placeholder
	/** @type {string} */
	let placeholder;
	$: {
		if (customType !== '' && phrases.placeholder[customType] !== void 0) {
			placeholder = phrases.placeholder[customType];
		} else if (
			info &&
			info.name &&
			phrases.placeholder.collection !== void 0
		) {
			placeholder = phrases.placeholder.collection.replace(
				'{name}',
				info.name
			);
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
		autofocus={canFocusSearch} />
	<button class="iif-form-button iif-form-button--primary" focusable="false">
		{phrases.button}
	</button>
</Block>
