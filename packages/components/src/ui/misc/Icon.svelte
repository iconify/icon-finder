<script context="module">
	import Iconify from '@iconify/iconify';

	Iconify.enableCache('local', false);
	Iconify.enableCache('session', false);

	// @iconify-replacement: 'uiIcons = {}'
	const uiIcons = {};
	// @iconify-replacement: 'uiCustomIcons = []'
	const uiCustomIcons = [];
	// @iconify-replacement: 'uiIconsClass = '''
	const uiIconsClass = '';

	// Add custom icons to Iconify
	uiCustomIcons.forEach(data => {
		Iconify.addCollection(data);
	});

	// Preload icons
	Iconify.loadIcons(Object.values(uiIcons));
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
		let newName =
			typeof uiIcons[icon] === 'string'
				? uiIcons[icon]
				: icon.indexOf(':') === -1
				? null
				: icon;
		// console.log('Rendering icon:', icon);

		if (newName !== name) {
			// Update variable only when changed because it is a watched variable
			name = newName;
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
