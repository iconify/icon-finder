<script context="module">
	import Iconify from '@iconify/iconify';

	Iconify.enableCache('local', false);
	Iconify.enableCache('session', false);

	// @iconify-replacement: 'uiIcons = {}'
	const uiIcons = {};

	// Add custom icons to Iconify
	const customProvider = 'iif-custom';
	const customPrefix = 'iif-custom';
	const customIcons = {
		provider: customProvider,
		prefix: customPrefix,
		icons: Object.create(null),
		aliases: Object.create(null),
	};
	let hasCustomIcons = false;

	const preload = [];
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
				break;

			case 'string':
				if (key !== 'class' && value.indexOf(':') !== -1) {
					preload.push(value);
				}
		}
	});

	if (hasCustomIcons) {
		Iconify.addCollection(customIcons);
	}
	if (preload.length) {
		Iconify.loadIcons(preload);
	}
</script>

<script>
	import { onDestroy } from 'svelte';

	export let icon; /** @type {string} */
	export let props; /** @type {object} */
	export let onLoad; /** @type {function} */

	// Local watched variables. Update them only if needed to avoid duplicate re-renders
	let name = '';
	let loaded = false;
	let svg = '';
	let updateCounter = 0;
	let abortLoader = null;

	// Resolve icon name
	$: {
		let newName;
		// console.log('Rendering icon:', icon);
		switch (typeof uiIcons[icon]) {
			case 'string':
				// Icon value is icon name
				newName = uiIcons[icon];
				break;

			case 'object':
				// Custom icon
				newName = '@' + customProvider + ':' + customPrefix + ':' + icon;
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
		// Mention updateCounter to make sure this code is ran
		updateCounter;

		if (name !== null) {
			if (loaded !== Iconify.iconExists(name)) {
				// Update variable only if it needs to be updated
				loaded = !loaded;
				if (loaded && typeof onLoad === 'function') {
					onLoad();
				}
			}
			if (!loaded) {
				// Icon is not loaded
				if (abortLoader !== null) {
					abortLoader();
				}
				abortLoader = Iconify.loadIcons([name], loadingEvent);
				// console.log('Missing icon:', name);
			} else {
				// Icon is loaded - generate SVG
				const iconProps = Object.assign(
					{
						inline: false,
					},
					typeof props === 'object' ? props : {}
				);
				// console.log('Rendering:', name, iconProps);
				let newSVG = Iconify.renderHTML(name, iconProps);
				// console.log('Got:', newSVG);
				if (uiIcons['class'] !== void 0) {
					newSVG = newSVG.replace(
						' class="iconify ',
						' class="iconify ' + uiIcons['class'] + ' '
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
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

{#if loaded}
	{@html svg}
{:else}
	<slot />
{/if}
