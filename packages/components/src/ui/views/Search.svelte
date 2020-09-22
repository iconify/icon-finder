<script>
	import { getProvider } from '@iconify/search-core';
	import FiltersBlock from '../blocks/Filters.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {PartialRoute} */
	export let route;
	/** @type {Icon | null} */
	export let selectedIcon;
	/** @type {CollectionViewBlocks | null} */
	export let blocks;

	/** @type {string} */
	let keyword;
	$: {
		keyword = route.params.keyword;
	}

	// Get collection link
	/** @type {string} */
	let collectionsLink;
	$: {
		let provider = route.params.provider;
		if (typeof provider !== 'string') {
			provider = '';
		}

		// Get collection link
		const providerData = getProvider(provider);
		if (providerData) {
			collectionsLink = providerData.links.collection;
		} else {
			collectionsLink = '';
		}
	}
</script>

<div class="iif-view iif-view--search">
	{#if blocks.collections}
		<FiltersBlock
			{registry}
			name="collections"
			block={blocks.collections}
			link={collectionsLink} />
	{/if}

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
