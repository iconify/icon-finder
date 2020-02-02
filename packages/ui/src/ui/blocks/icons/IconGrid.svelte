<script context="module">
	import Iconify from '@iconify/iconify';

	const baseClass = 'iif-icon-grid';
</script>

<script>
	export let item; /** @type {{name: string, tooltip: string, text: string, icon: Icon, exists: boolean, selected: boolean, link: string}} */
	export let onClick;

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

	// Select icon
	function handleClick() {
		onClick('icons', item.icon);
	}
</script>

<li class={className}>
	<a
		href={item.link}
		target="_blank"
		title={item.tooltip}
		on:click|preventDefault={handleClick}>
		{#if svg !== false}
			{@html svg}
		{/if}
	</a>
</li>
