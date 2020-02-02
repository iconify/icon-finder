<script>
	import Iconify from '@iconify/iconify';
	import { onDestroy } from 'svelte';
	import { iconToString } from '../../../core/lib/icon';

	// @iconify-replacement: '/footer/Empty.svelte'
	import Footer from './footer/Empty.svelte';

	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */
	export let route; /** @type {PartialRoute} */

	// Get icon name as string
	let iconName;
	$: {
		iconName = selectedIcon === null ? '' : iconToString(selectedIcon);
	}

	// Event listener
	let updateCounter = 0;
	let assignedEvent = false;
	const loadingEvent = () => {
		updateCounter++;
	};

	// Load icon
	let loaded;
	$: {
		loaded = false;
		if (selectedIcon !== null) {
			loaded = Iconify.iconExists(iconName);
			if (!loaded) {
				if (!assignedEvent) {
					assignedEvent = true;
					document.addEventListener('IconifyAddedIcons', loadingEvent, true);
				}
				Iconify.preloadImages([iconName]);
			}
		}
	}

	// Remove event listener
	onDestroy(() => {
		if (assignedEvent) {
			document.removeEventListener('IconifyAddedIcons', loadingEvent, true);
		}
	});
</script>

{#if loaded}
	<Footer {registry} {selectedIcon} {iconName} {route} />
{/if}
