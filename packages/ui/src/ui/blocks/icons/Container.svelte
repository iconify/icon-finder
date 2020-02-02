<script context="module">
	import Iconify from '@iconify/iconify';
	import { iconToString } from '../../../../../core/lib/icon';
	import { compare } from '../../../../../core/lib/objects';
	import IconList from './IconList.svelte';
	import IconGrid from './IconGrid.svelte';

	Iconify.setConfig('localStorage', false);
	Iconify.setConfig('sessionStorage', false);

	const baseClass = 'iif-icons';
</script>

<script>
	import { onDestroy } from 'svelte';

	export let registry; /** @type {Registry} */
	export let route; /** @type {PartialRoute} */
	export let selectedIcon; /** @type {Icon | null} */
	export let blocks; /** @type {ViewBlocks} */
	export let isList; /** @type {boolean} */

	const options = registry.options;
	const phrases = registry.phrases;
	const uncategorised = phrases.filters.uncategorised;
	const tooltipText = phrases.icons.tooltip;

	// Show prefix
	let showPrefix;
	$: {
		showPrefix = route.type !== 'collection';
	}

	// Event listener for loading icons
	let assignedEvent = false;
	let updateCounter = 0;
	const loadingEvent = () => {
		updateCounter++;
	};

	// Filter icons
	let parsedIcons = [];
	$: {
		// Mention updateCounter to make sure this code is ran
		updateCounter;

		// Reset icons list
		parsedIcons = [];

		// Parse icons
		let pending = [];
		let selectedName = selectedIcon === null ? '' : iconToString(selectedIcon);

		blocks.icons.icons.forEach(icon => {
			const name = iconToString(icon);
			const data = Iconify.getIcon(name);
			const exists = data !== null;
			let tooltip = showPrefix ? name : icon.name;
			if (exists) {
				tooltip += tooltipText.size.replace(
					'{size}',
					data.width + ' x ' + data.height
				);
				tooltip += tooltipText.length.replace('{length}', data.body.length);
				if (icon.chars !== void 0) {
					tooltip += tooltipText.char.replace(
						'{char}',
						typeof icon.chars === 'string' ? icon.chars : icon.chars.join(', ')
					);
				}
				tooltip +=
					tooltipText[
						data.body.indexOf('currentColor') === -1 ? 'colorful' : 'colorless'
					];
			}
			const item = {
				name,
				text: showPrefix ? name : icon.name,
				tooltip,
				icon,
				exists,
				link: options.links.icon
					.replace('{prefix}', icon.prefix)
					.replace('{name}', icon.name),
				selected: name === selectedName,
			};

			parsedIcons.push(item);
			if (!exists) {
				pending.push(name);
			}
		});

		// Load pending images
		if (pending.length) {
			if (!assignedEvent) {
				assignedEvent = true;
				document.addEventListener('IconifyAddedIcons', loadingEvent, true);
			}
			Iconify.preloadImages(pending);
		}
	}

	function onClick(block, value) {
		if (block === 'icons') {
			const callback = registry.callback;
			callback('selection', value);
			return;
		}
		registry.router.action(block, value);
	}

	// Remove event listener
	onDestroy(() => {
		if (assignedEvent) {
			document.removeEventListener('IconifyAddedIcons', loadingEvent, true);
		}
	});
</script>

<div class={baseClass + ' ' + baseClass + (isList ? '--list' : '--grid')}>
	<ul>
		{#each parsedIcons as item, i (item.name)}
			{#if isList}
				<IconList {item} {blocks} {route} {onClick} {uncategorised} />
			{:else}
				<IconGrid {item} {onClick} />
			{/if}
		{/each}
	</ul>
</div>
