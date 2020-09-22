<script context="module">
	import Iconify from '@iconify/iconify';

	const baseClass = 'iif-icon-grid';
</script>

<script>
	// ...item
	/** @type {string} */
	export let name;
	/** @type {string} */
	export let tooltip;
	/** @type {string} */
	// export let text;
	/** @type {string} */
	export let icon;
	/** @type {boolean} */
	export let exists;
	/** @type {boolean} */
	export let selected;
	/** @type {string} */
	export let link;
	/** @type {function} */
	export let onClick;

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
	/** @type {string | boolean} */
	let svg = false;
	$: {
		const newSVG = exists
			? Iconify.renderHTML(name, {
					width: '1em',
					height: '1em',
					inline: false,
			  })
			: false;
		if (newSVG !== svg) {
			// Trigger re-render only if SVG was changed
			svg = newSVG;
		}
	}

	// Select icon
	function handleClick() {
		onClick('icons', icon);
	}
</script>

<li class={className}>
	<a
		href={link}
		target="_blank"
		title={tooltip}
		on:click|preventDefault={handleClick}>
		{#if svg !== false}
			{@html svg}
		{/if}
	</a>
</li>
