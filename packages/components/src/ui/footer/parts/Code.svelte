<script>
	import Iconify from '@iconify/iconify';

	// export let registry; /** @type {Registry} */
	export let iconName; /** @type {string} */
	// export let iconCustomisations; /** @type {IconCustomisations} */

	// Get icon data
	let iconData;
	$: {
		iconData = Iconify.getIcon(iconName);
	}
</script>

{#if iconData}
	<div>Code blocks!</div>
{/if}
