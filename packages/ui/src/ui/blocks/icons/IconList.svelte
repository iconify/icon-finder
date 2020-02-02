<script context="module">
	// List of key maps: key = block name, value = icon attribute
	const filtersMap = {
		tags: 'tags',
		themePrefixes: 'themePrefix',
		themeSuffixes: 'themeSuffix',
	};
	const filterKeys = Object.keys(filtersMap);

	const baseClass = 'iif-icon-list';
</script>

<script>
	import Filter from '../filters/Filter.svelte';

	export let blocks; /** @type {ViewBlocks} */
	export let item; /** @type {{name: string, tooltip: string, text: string, icon: Icon, exists: boolean, selected: boolean, link: string}} */
	export let onClick; /** @type {function} */
	export let uncategorised; /** @type {string} */
	export let route; /** @type {PartialRoute} */

	// Get class name
	let className;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(item.exists ? '--loaded' : '--loading') +
			(item.selected ? ' ' + baseClass + '--selected' : '');
	}

	// Get SVG
	let svg;
	$: {
		svg = item.exists
			? Iconify.getSVG(item.name, {
					'data-width': '1em',
					'data-height': '1em',
					'data-inline': false,
			  })
			: false;
	}

	// Get size
	let size;
	$: {
		size = item.exists ? Iconify.getIcon(item.name) : null;
	}

	// Select icon
	function handleClick() {
		onClick('icons', item.icon);
	}

	// Get filters
	let filters = [];
	$: {
		filters = [];
		const icon = item.icon;

		// Filters
		filterKeys.forEach(key => {
			if (!blocks[key]) {
				return;
			}
			const attr = filtersMap[key];
			if (icon[attr] === void 0) {
				return;
			}

			const block = blocks[key];
			const active = block.active;
			const iconValue = icon[attr];

			(typeof iconValue === 'string' ? [iconValue] : iconValue).forEach(
				value => {
					if (value === active) {
						return;
					}
					if (block.filters[value] !== void 0) {
						filters.push({
							action: key,
							value: value,
							item: block.filters[value],
						});
					}
				}
			);
		});

		// Icon sets
		if (route.type === 'search' && blocks.collections) {
			const prefix = item.icon.prefix;
			if (blocks.collections.filters[prefix]) {
				filters.push({
					action: 'collections',
					value: prefix,
					item: blocks.collections.filters[prefix],
				});
			}
		}
	}
</script>

<li class={className}>
	<div class="iif-icon-sample">
		<a
			href={item.link}
			target="_blank"
			title={item.tooltip}
			on:click|preventDefault={handleClick}>
			{#if svg !== false}
				{@html svg}
			{/if}
		</a>
	</div>

	<div class={'iif-icon-data iif-icon-data--filters--' + filters.length}>
		<a
			class="iif-icon-name"
			href={item.link}
			title={item.tooltip}
			on:click|preventDefault={handleClick}>
			{item.text}
		</a>
		{#if item.exists}
			<div class="iif-icon-size">{size.width} x {size.height}</div>
		{/if}
		{#if filters}
			{#each filters as filter}
				<Filter
					filter={filter.item}
					title={filter.item.title === '' ? uncategorised : filter.item.title}
					onClick={() => onClick(filter.action, filter.value)} />
			{/each}
		{/if}
	</div>
</li>
