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
	export let props; /** @type {object} */
	export let onLoad; /** @type {function} */

	// Local watched variables. Update them only if needed to avoid duplicate re-renders
	let name = '';
	let loaded = false;
	let svg = '';
	let updateCounter = 0;
	let assignedEvent = false;

	// Resolve icon name
	$: {
		let newName;
		switch (typeof uiIcons[icon]) {
			case 'string':
				// Icon value is icon name
				newName = uiIcons[icon];
				break;

			case 'object':
				// Custom icon
				newName = customPrefix + ':' + icon;
				break;

			case 'undefined':
				// Icon key as icon name
				newName = icon.indexOf(':') === -1 ? null : icon;
				break;

			default:
				newName = null;
		}
		if (newName !== name) {
			// Update variable only when changed because it is a watched variable
			name = newName;
			loaded = false;
		}
	}

	// Event listener
	const loadingEvent = () => {
		if (name !== null && Iconify.iconExists(name) && !loaded) {
			// Force update
			updateCounter++;
		}
	};

	// Check if icon has been loaded
	$: {
		updateCounter;
		if (name !== null) {
			if (loaded !== Iconify.iconExists(name)) {
				// Update variable only if it needs to be updated
				loaded = !loaded;
				if (typeof onLoad === 'function') {
					onLoad();
				}
			}
			if (!loaded) {
				// Icon is not loaded - assign loading event listener and load it
				if (!assignedEvent) {
					assignedEvent = true;
					document.addEventListener('IconifyAddedIcons', loadingEvent, true);
				}
				Iconify.preloadImages([name]);
			} else {
				// Icon is loaded - generate SVG
				const iconProps = Object.assign(
					{
						'data-inline': false,
						'data-height': height ? height : defaultHeight,
					},
					typeof props === 'object' ? props : {}
				);
				let newSVG = Iconify.getSVG(name, iconProps);
				if (uiIcons['class'] !== void 0) {
					// Temporary fix until Iconify 2 is available
					newSVG = newSVG.replace(
						'<svg ',
						'<svg class="' + uiIcons['class'] + '" '
					);
				}

				// Compare SVG with previous entry to avoid marking 'svg' variable as dirty and causing re-render
				if (newSVG !== svg) {
					svg = newSVG;
				}
			}
		} else if (loaded) {
			// Icon was loaded and is no longer loaded. Icon name changed?
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
