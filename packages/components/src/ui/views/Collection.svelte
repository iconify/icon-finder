<script context="module">
	const filterBlocks = ['tags', 'themePrefixes', 'themeSuffixes'];
	const baseClass = 'iif-view--collection';
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import FiltersBlock from '../blocks/Filters.svelte';
	import CollectionInfoBlock from '../blocks/CollectionInfo.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */
	export let blocks; /** @type {CollectionViewBlocks | null} */
	export let route; /** @type {PartialRoute} */

	let provider; /** @type {string} */
	let prefix; /** @type {string} */
	let info; /** @type {CollectionInfo | null} */
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
</script>

<div
	class="iif-view {baseClass}
	{baseClass}--prefix--{prefix + (provider === '' ? '' : ' ' + baseClass + '--provider--' + provider)}">
	{#if blocks.collections}
		<FiltersBlock
			{registry}
			name="collections"
			parent={route.parent ? route.parent.type : 'collections'}
			link={collectionsLink}
			block={blocks.collections} />
	{/if}

	{#if info !== null}
		<CollectionInfoBlock {registry} name="info" block={blocks.info} />
	{/if}

	<SearchBlock {registry} name="filter" block={blocks.filter} {info} />

	{#each filterBlocks as key, i (key)}
		{#if blocks[key]}
			<FiltersBlock {registry} name={key} block={blocks[key]} />
		{/if}
	{/each}

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
