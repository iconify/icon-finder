<script>
	import { getProvider } from '@iconify/search-core';
	import Block from '../Block.svelte';
	import Filter from './filters/Filter.svelte';

	/**
	 * Global exports
	 */
	export let registry; /** @type {Registry} */
	// export let route; /** @type {PartialRoute} */
	export let activeProvider; /** @type {string} */
	export let providers; /** @type {string[]} */

	const title = registry.phrases.filters.providers;

	function handleClick(key) {
		console.log('Changing provider to:', key);
		registry.router.action('provider', key);
	}

	let list;
	$: {
		list = [];
		providers.forEach((provider, index) => {
			const item = getProvider(provider);
			if (item) {
				list.push({
					provider,
					title: item.title,
					selected: activeProvider === provider,
					filter: {
						index,
					},
				});
			}
		});
	}
</script>

<Block type="filters" name="providers">
	<div class="iif-filters-header">{title}</div>
	<div class="iif-filters-list">
		{#each list as provider, i (provider.provider)}
			<Filter
				active={provider.selected}
				title={provider.title}
				filter={provider.filter}
				onClick={() => handleClick(provider.provider)} />
		{/each}
	</div>
</Block>
