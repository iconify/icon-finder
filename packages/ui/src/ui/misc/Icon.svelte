<script context="module">
	import Iconify from '@iconify/iconify';

	Iconify.setConfig('localStorage', false);
	Iconify.setConfig('sessionStorage', false);

	// @iconify-replacement: 'uiIcons = {}'
	const uiIcons = {};
	const defaultHeight = uiIcons.size;

	// Add custom icons to Iconify
	const customPrefix = 'iif-custom';
	const customIcons = {
		prefix: customPrefix,
		icons: Object.create(null),
		aliases: Object.create(null),
	};
	let hasCustomIcons = false;

	Object.keys(uiIcons).forEach(key => {
		const value = uiIcons[key];
		switch (typeof value) {
			case 'number':
				customIcons[key] = value;
				break;

			case 'object':
				hasCustomIcons = true;
				customIcons[
					value.body === void 0 && value.parent !== void 0 ? 'aliases' : 'icons'
				][key] = value;
		}
	});

	if (hasCustomIcons) {
		Iconify.addCollection(customIcons);
	}
</script>

<script>
	import { onDestroy } from 'svelte';

	export let icon; /** @type {string} */
	export let height; /** @type {string|number} */

	// Resolve icon name
	let name;
	$: {
		switch (typeof uiIcons[icon]) {
			case 'string':
				name = uiIcons[icon];
				break;

			case 'object':
				name = customPrefix + ':' + icon;
				break;

			default:
				name = null;
		}
	}

	// Event listener
	let updateCounter = 0;
	const loadingEvent = () => {
		updateCounter++;
	};

	// Check if icon has been loaded
	let assignedEvent = false;
	let loaded;
	let svg;
	$: {
		svg = '';
		if (name !== null) {
			loaded = Iconify.iconExists(name);
			if (!loaded) {
				if (!assignedEvent) {
					assignedEvent = true;
					document.addEventListener('IconifyAddedIcons', loadingEvent, true);
				}
				Iconify.preloadImages([name]);
			} else {
				svg = Iconify.getSVG(name, {
					'data-height': height ? height : defaultHeight,
					'data-inline': false,
				});
			}
		} else {
			loaded = false;
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
	{@html svg}
{:else}
	<slot />
{/if}
