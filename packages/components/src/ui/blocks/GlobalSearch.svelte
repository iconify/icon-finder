<script>
	import Input from '../forms/Input.svelte';
	import Block from '../Block.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let viewChanged;
	/** @type {PartialRoute} */
	export let route;

	// @iconify-replacement: 'canFocusSearch = true'
	const canFocusSearch = true;

	// Phrases
	/** @type {UITranslation.search} */
	const phrases = registry.phrases.search;

	// Current keyword
	/** @type {string | null} */
	let keyword = null;

	// Variable to store last change to avoid changing keyword multiple times to same value
	let lastChange = '';

	// Check route for keyword
	function checkRoute(route) {
		if (
			route.type === 'search' &&
			(lastChange === '' || lastChange !== route.params.search)
		) {
			keyword = route.params.search;
			lastChange = keyword;
			return true;
		}
		return false;
	}

	// Submit form
	function submitForm() {
		const value = keyword.trim().toLowerCase();
		if (value !== '') {
			lastChange = value;
			registry.router.action('search', value);
		}
	}

	// Overwrite keyword on first render or when current view changes to search results
	$: {
		if (keyword === null) {
			// First render - get keyword from route
			keyword = '';
			if (route !== null) {
				// Get keyword from current route or its parent
				if (!checkRoute(route) && route.parent !== void 9) {
					checkRoute(route.parent);
				}
			}
		} else if (!viewChanged) {
			lastChange = '';
		} else {
			checkRoute(route);
		}
	}

	// Focus input, use "each" to re-mount input when value changes
	let focusInput = false;
	$: {
		if (canFocusSearch) {
			focusInput =
				route &&
				(route.type === 'collections' || route.type === 'search');
		}
	}
</script>

<Block type="search" name="global">
	<form on:submit|preventDefault={submitForm} class="iif-block--search-form">
		{#each [focusInput] as autofocus, i (autofocus)}
			<Input
				type="text"
				bind:value={keyword}
				placeholder={phrases.defaultPlaceholder}
				icon="search"
				{autofocus} />
		{/each}
		<button class="iif-form-button iif-form-button--primary" type="submit">
			{phrases.button}
		</button>
	</form>
</Block>
