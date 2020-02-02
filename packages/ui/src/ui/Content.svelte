<script>
	import SearchBlock from './blocks/GlobalSearch.svelte';
	import ParentBlock from './blocks/Parent.svelte';
	import ViewError from './views/Error.svelte';
	import CollectionsView from './views/Collections.svelte';
	import CollectionView from './views/Collection.svelte';
	import SearchView from './views/Search.svelte';
	import CustomView from './views/Custom.svelte';

	/**
	 * Global exports
	 */
	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */

	// RouterEvent
	export let viewChanged; /** @type {boolean} */
	export let error; /** @type {string} */
	export let route; /** @type {PartialRoute} */
	export let blocks; /** @type {ViewBlocks | null} */

	const baseClass = 'iif-content';
	let className, searchValue;
	$: {
		// Check class name and search form value
		className = baseClass;

		if (error !== '') {
			// View shows error
			className +=
				' ' + baseClass + '--error ' + baseClass + '--error--' + error;
		} else {
			// View shows something
			className +=
				' ' + baseClass + '--view ' + baseClass + '--view--' + route.type;

			switch (route.type) {
				case 'collection':
					// Add prefix: '{base} {base}--view {base}--view--collection {base}--view--collection--{prefix}'
					className +=
						' ' + baseClass + '--view--collection--' + route.params.prefix;
					break;

				case 'custom':
					// Add custom type: '{base} {base}--view {base}--view--custom {base}--view--custom--{customType}'
					className +=
						' ' + baseClass + '--view--custom--' + route.params.customType;
					break;
			}
		}
	}

	// Check if collections list is in route, don't show global search if its not there
	let showGlobalSearch;
	$: {
		showGlobalSearch = false;
		let item = route;
		while (!showGlobalSearch && item !== null) {
			if (item.type === 'collections') {
				showGlobalSearch = true;
			} else {
				item = item.parent ? item.parent : null;
			}
		}
	}
</script>

<div class={className}>
	{#if showGlobalSearch}
		<SearchBlock {registry} {viewChanged} {error} {route} />
	{/if}

	{#if route && route.parent}
		<ParentBlock {registry} {route} />
	{/if}

	{#if error !== '' || !route}
		<ViewError {registry} error={error !== '' ? error : 'bad_route'} {route} />
	{:else if route.type === 'collections'}
		<CollectionsView {registry} {blocks} />
	{:else if route.type === 'collection'}
		<CollectionView {registry} {route} {blocks} {selectedIcon} />
	{:else if route.type === 'search'}
		<SearchView {registry} {route} {blocks} {selectedIcon} />
	{:else if route.type === 'custom'}
		<CustomView {registry} {route} {blocks} {selectedIcon} />
	{:else}
		<ViewError {registry} error="bad_route" {route} />
	{/if}
</div>
