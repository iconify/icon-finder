<script context="module">
	const filterBlocks = ['tags', 'themePrefixes', 'themeSuffixes'];
	const baseClass = 'iif-view--collection';

	// @iconify-replacement: 'showCollectionInfoBlock = true'
	const showCollectionInfoBlock = true;
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import FiltersBlock from '../blocks/Filters.svelte';
	// @iconify-replacement: '../blocks/CollectionInfo.svelte'
	import CollectionInfoBlock from '../blocks/CollectionInfo.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {Icon | null} */
	export let selectedIcon;
	/** @type {CollectionViewBlocks | null} */
	export let blocks;
	/** @type {PartialRoute} */
	export let route;

	/** @type {string} */
	let provider;
	/** @type {string} */
	let prefix;
	/** @type {CollectionInfo | null} */
	let info;
	/** @type {string} */
	let collectionsLink;
	$: {
		provider = route.params.provider;
		if (typeof provider !== 'string') {
			provider = '';
		}
		prefix = route.params.prefix;
		info = blocks.info === null ? null : blocks.info.info;

		// Get collection link
		const providerData = getProvider(provider);
		if (providerData) {
			collectionsLink = providerData.links.collection;
		} else {
			collectionsLink = '';
		}
	}

	/** @type {boolean} */
	let hasFilters;
	$: {
		hasFilters = filterBlocks.filter((key) => !!blocks[key]).length > 0;
	}
</script>

<div
	class="iif-view {baseClass}
		{baseClass}--prefix--{prefix + (provider === '' ? '' : ' ' + baseClass + '--provider--' + provider)}">
	{#if blocks.collections}
		<div class="iff-filters">
			<FiltersBlock
				{registry}
				name="collections"
				parent={route.parent ? route.parent.type : 'collections'}
				link={collectionsLink}
				block={blocks.collections} />
		</div>
	{/if}

	{#if showCollectionInfoBlock && info !== null}
		<CollectionInfoBlock {registry} name="info" block={blocks.info} />
	{/if}

	<SearchBlock {registry} name="filter" block={blocks.filter} {info} />

	{#if hasFilters}
		<div class="iff-filters">
			{#each filterBlocks as key, i (key)}
				{#if blocks[key]}
					<FiltersBlock {registry} name={key} block={blocks[key]} />
				{/if}
			{/each}
		</div>
	{/if}

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
