<script>
	import Iconify from '@iconify/iconify';

	/** @type {Registry} */
	// export let registry;
	/** @type {string} */
	export let iconName;
	/** @type {IconCustomisations} */
	// export let iconCustomisations;

	// Get icon data
	/** @type {IconifyIcon | null} */
	let iconData;
	$: {
		iconData = Iconify.getIcon(iconName);
	}
</script>

{#if iconData}
	<div>Code blocks!</div>
{/if}
