<script context="module">
	// @iconify-replacement: 'maxIndex = 10'
	const maxIndex = 10;
	const baseClass = 'iif-filter';
</script>

<script>
	export let active; /** @type {boolean} */
	export let hasActive; /** @type {boolean} */
	export let filter; /** @type {FiltersFilter} */
	export let title; /** @type {string} */
	export let onClick; /** @type {function} */
	export let link; /** @type {string} */

	let className;
	$: {
		className =
			baseClass +
			(active
				? ' ' + baseClass + '--selected'
				: hasActive
				? ' ' + baseClass + '--unselected'
				: '') +
			(filter.index ? ' ' + baseClass + '--' + (filter.index % maxIndex) : '');
	}
</script>

{#if link}
	<a class={className} on:click|preventDefault={onClick} href={link}>{title}</a>
{:else}
	<button
		class={className}
		disabled={filter.disabled}
		on:click|preventDefault={onClick}>
		{title}
	</button>
{/if}
