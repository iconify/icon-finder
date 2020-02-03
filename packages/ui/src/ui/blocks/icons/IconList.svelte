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

	// ...item
	export let name; /** @type {string} */
	export let tooltip; /** @type {string} */
	export let text; /** @type {string} */
	export let icon; /** @type {string} */
	export let exists; /** @type {boolean} */
	export let selected; /** @type {boolean} */
	export let link; /** @type {string} */
	export let filters; /** @type {Array} */

	export let onClick; /** @type {function} */
	export let uncategorised; /** @type {string} */

	// Get class name
	let className = '';
	$: {
		const newClassName =
			baseClass +
			' ' +
			baseClass +
			(exists ? '--loaded' : '--loading') +
			(selected ? ' ' + baseClass + '--selected' : '');
		if (newClassName !== className) {
			// Trigger re-render only if value was changed
			className = newClassName;
		}
	}

	// Get SVG
	let svg = false;
	$: {
		const newSVG = exists
			? Iconify.getSVG(name, {
					'data-width': '1em',
					'data-height': '1em',
					'data-inline': false,
			  })
			: false;
		if (newSVG !== svg) {
			// Trigger re-render only if SVG was changed
			svg = newSVG;
		}
	}

	// Get size
	let size = null;
	$: {
		const newSize = exists ? Iconify.getIcon(name) : null;
		if (newSize !== size) {
			size = newSize;
		}
	}

	// Select icon
	function handleClick() {
		onClick('icons', icon);
	}
</script>

<li class={className}>
	<div class="iif-icon-sample">
		<a
			href={link}
			target="_blank"
			title={tooltip}
			on:click|preventDefault={handleClick}>
			{#if svg !== false}
				{@html svg}
			{/if}
		</a>
	</div>

	<div class={'iif-icon-data iif-icon-data--filters--' + filters.length}>
		<a
			class="iif-icon-name"
			href={link}
			title={tooltip}
			on:click|preventDefault={handleClick}>
			{text}
		</a>
		{#if exists}
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
