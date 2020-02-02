<script>
	import Block from '../Block.svelte';
	import Filter from './filters/Filter.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let parent; /** @type {string} */
	export let block; /** @type {FiltersBlock | null} */

	const phrases = registry.phrases; /** @type {UITranslation} */

	function handleClick(key) {
		registry.router.action(name, key === block.active ? null : key);
	}

	let title; /** @type {string} */
	$: {
		let key = name;
		if (typeof parent === 'string' && parent !== '') {
			if (phrases.filters[name + '-' + parent] !== void 0) {
				key = name + '-' + parent;
			}
		}
		title = phrases.filters[key] === void 0 ? '' : phrases.filters[key];
	}

	let filters; /** @type {string[]} */
	let isVisible; /** @type {boolean} */
	$: {
		filters = block === null ? [] : Object.keys(block.filters);
		isVisible = filters.length > 1;
	}

	let extra; /** @type {string} */
	$: {
		extra = block === null || block.active === null ? '' : 'filters--active';
	}
</script>

{#if isVisible}
	<Block type="filters" {name} {extra}>
		{#if title !== ''}
			<div class="iif-filters-header">{title}</div>
		{/if}
		<div class="iif-filters-list">
			{#each Object.entries(block.filters) as [key, filter], i (key)}
				<Filter
					active={key === block.active}
					hasActive={block.active !== null}
					{filter}
					title={filter.title === '' ? phrases.filters.uncategorised : filter.title}
					onClick={() => handleClick(key)} />
			{/each}
		</div>
	</Block>
{/if}
