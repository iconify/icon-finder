<script context="module">
	// Footer options: buttons, customisations
	// @iconify-replacement: 'footerOptions = {}'
	let footerOptions = {};
</script>

<script>
	import Iconify from '@iconify/iconify';
	import { onDestroy } from 'svelte';
	import { iconToString } from '@iconify/search-core';

	// @iconify-replacement: '/footer/Simple.svelte'
	import Footer from './footer/Simple.svelte';
	import {
		emptyCustomisations,
		mergeCustomisations,
		filterCustomisations,
	} from '../misc/customisations';

	export let registry; /** @type {Registry} */
	export let selectedIcon; /** @type {Icon | null} */
	export let customisations; /** @type {PartialIconCustomisations} */
	export let route; /** @type {PartialRoute} */

	// Translate buttons
	if (footerOptions.buttons) {
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
	}

	// Customisations
	let iconCustomisations;
	$: {
		iconCustomisations = mergeCustomisations(
			emptyCustomisations,
			customisations
		);
	}

	// Change icon customisation value
	function customise(prop, value) {
		if (
			iconCustomisations[prop] !== void 0 &&
			iconCustomisations[prop] !== value &&
			typeof iconCustomisations[prop] === typeof value
		) {
			// Change value then change object to force Svelte update components
			iconCustomisations[prop] = value;
			iconCustomisations = mergeCustomisations(
				emptyCustomisations,
				iconCustomisations
			);

			// Send event: UICustomisationEvent
			registry.callback({
				type: 'customisation',
				// IconCustomisationPairs
				changed: {
					prop,
					value,
				},
				customisations: filterCustomisations(iconCustomisations),
			});
		}
	}

	// Get icon name as string
	let iconName = '';
	$: {
		iconName = selectedIcon === null ? '' : iconToString(selectedIcon);
	}

	// Event listener
	let updateCounter = 0;
	let abortLoader = null;
	const loadingEvent = () => {
		updateCounter++;
	};

	// Load icon
	let loaded;
	$: {
		// Mention updateCounter to make sure this code is ran
		updateCounter;

		loaded = selectedIcon ? Iconify.iconExists(iconName) : false;
		if (selectedIcon && !loaded) {
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = Iconify.loadIcons([iconName], loadingEvent);
		}
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
		}
	});
</script>

<Footer
	{footerOptions}
	{registry}
	{loaded}
	{selectedIcon}
	{iconName}
	{customise}
	{iconCustomisations}
	{route} />
