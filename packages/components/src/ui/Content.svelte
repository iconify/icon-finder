<script>
	import { listProviders } from '@iconify/search-core';
	import SearchBlock from './blocks/GlobalSearch.svelte';
	import ParentBlock from './blocks/Parent.svelte';
	import ProvidersBlock from './blocks/Providers.svelte';
	import ViewError from './views/Error.svelte';
	import CollectionsView from './views/Collections.svelte';
	import CollectionView from './views/Collection.svelte';
	import SearchView from './views/Search.svelte';
	// @iconify-replacement: './views/Custom.svelte'
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

	// @iconify-replacement: 'supportCustomView = true'
	const supportCustomView = true;

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

			if (
				route.params &&
				(route.type === 'search' ||
					route.type === 'collections' ||
					route.type === 'collection') &&
				route.params.provider
			) {
				// Add provider: '{base}--view--{type}--provider--{provider}'
				className +=
					' ' +
					baseClass +
					'--view--' +
					route.type +
					'--provider--' +
					route.params.provider;
			}

			if (route.type === 'collection') {
				// Add prefix: '{base}--view--collection--prefix--{prefix}'
				className +=
					' ' +
					baseClass +
					'--view--collection--prefix--' +
					route.params.prefix;
			} else if (supportCustomView && route.type === 'custom') {
				// Add custom type: '{base} {base}--view {base}--view--custom {base}--view--custom--{customType}'
				className +=
					' ' + baseClass + '--view--custom--' + route.params.customType;
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

	// Get providers
	let showProviders = false;
	let activeProvider = '';
	let providers = [''];
	$: {
		console.log('Updating providers');
		const providersList = listProviders();
		if (providersList.length > 1) {
			showProviders = true;

			// Get current provider
			if (route && route.params && typeof route.params.provider === 'string') {
				activeProvider = route.params.provider;
			} else {
				activeProvider = registry.router.defaultProvider;
			}

			// Create new list of providers
			if (!providers || providers.length !== providersList.length) {
				providers = providersList;
			}
		} else {
			showProviders = false;
		}
	}
</script>

<div class={className}>
	{#if showGlobalSearch}
		<SearchBlock {registry} {viewChanged} {error} {route} />
	{/if}

	{#if showProviders}
		<ProvidersBlock {registry} {route} {providers} {activeProvider} />
	{/if}

	{#if route && route.parent}
		<ParentBlock {registry} {route} />
	{/if}

	{#if !route || route.type !== 'empty'}
		{#if error !== '' || !route}
			<ViewError
				{registry}
				error={error !== '' ? error : 'bad_route'}
				{route} />
		{:else if route.type === 'collections'}
			<CollectionsView {registry} {route} {blocks} />
		{:else if route.type === 'collection'}
			<CollectionView {registry} {route} {blocks} {selectedIcon} />
		{:else if route.type === 'search'}
			<SearchView {registry} {route} {blocks} {selectedIcon} />
		{:else if supportCustomView && route.type === 'custom'}
			<CustomView {registry} {route} {blocks} {selectedIcon} />
		{:else}
			<ViewError {registry} error="bad_route" {route} />
		{/if}
	{/if}
</div>
