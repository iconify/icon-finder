<script>
	import Input from '../forms/Input.svelte';
	import Block from '../Block.svelte';
	// import Icon from '../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let viewChanged; /** @type {boolean} */
	export let route; /** @type {PartialRoute} */

	// @iconify-replacement: 'canFocusSearch = true'
	const canFocusSearch = true;

	// Phrases
	const phrases = registry.phrases.search; /** @type {UITranslation.search} */

	// Current keyword
	let keyword = null; /** @type {string|null} */

	// Variable to store last change to avoid changing keyword multiple times to same value
	let lastChange = ''; /** @type {string} */

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
				route && (route.type === 'collections' || route.type === 'search');
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
			<!-- <Icon icon="search" /> -->
			{phrases.button}
		</button>
	</form>
</Block>
