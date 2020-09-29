<script>
	import Block from '../Block.svelte';
	import Filter from './filters/Filter.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let name;
	/** @type {string} */
	export let parent;
	/** @type {FiltersBlock | null} */
	export let block;
	/** @type {string} */
	export let link;
	/** @type {function} */
	export let onClick;
	/** @type {boolean} */
	export let showTitle;
	/** @type {string} */
	export let title;

	/** @type {UITranslation} */
	const phrases = registry.phrases;

	function handleClick(key) {
		if (typeof onClick === 'function') {
			onClick(key);
		} else {
			registry.router.action(name, key === block.active ? null : key);
		}
	}

	/** @type {string} */
	let header;
	$: {
		if (showTitle === false) {
			header = '';
		} else if (typeof title === 'string') {
			header = title;
		} else {
			let key = name;
			if (typeof parent === 'string' && parent !== '') {
				if (phrases.filters[name + '-' + parent] !== void 0) {
					key = name + '-' + parent;
				}
			}
			header =
				phrases.filters[key] === void 0 ? '' : phrases.filters[key];
		}
	}

	/** @type {string[]} */
	let filters;
	/** @type {boolean} */
	let isVisible;
	$: {
		filters = block === null ? [] : Object.keys(block.filters);
		isVisible = filters.length > 1;
	}

	/** @type {string} */
	let extra;
	$: {
		extra =
			block === null || block.active === null ? '' : 'filters--active';
	}
</script>

{#if isVisible}
	<Block type="filters" {name} {extra}>
		{#if header !== ''}
			<div class="iif-filters-header">{header}</div>
		{/if}
		<div class="iif-filters-list">
			{#each Object.entries(block.filters) as [key, filter], i (key)}
				<Filter
					active={key === block.active}
					hasActive={block.active !== null}
					{filter}
					link={link ? link.replace('{prefix}', key) : link}
					title={filter.title === '' ? phrases.filters.uncategorised : filter.title}
					onClick={() => handleClick(key)} />
			{/each}
		</div>
	</Block>
{/if}
