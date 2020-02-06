<script context="module">
	// @iconify-replacement: 'footerOptions = {}'
	let footerOptions = {};
</script>

<script>
	import Iconify from '@iconify/iconify';
	import { onDestroy } from 'svelte';
	import { iconToString } from '../../../core/lib/icon';

	// @iconify-replacement: '/footer/Simple.svelte'
	import Footer from './footer/Simple.svelte';

	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */
	export let route; /** @type {PartialRoute} */

	// Translate buttons
	const phrases = registry.phrases;
	Object.keys(footerOptions.buttons).forEach(key => {
		const item = footerOptions.buttons[key];
		if (typeof item.text !== 'string') {
			// Set text: from phrases if phrase exists, capitalised key if not
			item.text =
				phrases.footerButtons[key] === void 0
					? key
							.split('-')
							.map(str => str.slice(0, 1).toUpperCase() + str.slice(1))
							.join(' ')
					: phrases.footerButtons[key];
		}
	});

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

<Footer {footerOptions} {registry} {loaded} {selectedIcon} {iconName} {route} />
