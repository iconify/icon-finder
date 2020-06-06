<script context="module">
	import Iconify from '@iconify/iconify';
	import {
		iconToString,
		cloneObject,
		compareObjects,
	} from '@iconify/search-core';
	import IconList from './IconList.svelte';
	import IconGrid from './IconGrid.svelte';

	Iconify.enableCache('local', false);
	Iconify.enableCache('session', false);

	const baseClass = 'iif-icons';

	// List of key maps: key = block name, value = icon attribute
	const filtersMap = {
		tags: 'tags',
		themePrefixes: 'themePrefix',
		themeSuffixes: 'themeSuffix',
	};
	const filterKeys = Object.keys(filtersMap);
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import { onDestroy } from 'svelte';

	export let registry; /** @type {Registry} */
	export let route; /** @type {PartialRoute} */
	export let selectedIcon; /** @type {Icon | null} */
	export let blocks; /** @type {ViewBlocks} */
	export let isList; /** @type {boolean} */

	// const options = registry.options;
	const phrases = registry.phrases;
	const uncategorised = phrases.filters.uncategorised;
	const tooltipText = phrases.icons.tooltip;

	// Show prefix
	let showPrefix;
	$: {
		showPrefix = route.type !== 'collection';
	}

	// Event listener for loading icons
	let abortLoader = null;
	let updateCounter = 0;
	const loadingEvent = () => {
		updateCounter++;
	};

	// Get filters to list view
	function getFilters(item) {
		let filters = [];
		const icon = item.icon;

		// Filters
		filterKeys.forEach(key => {
			if (!blocks[key]) {
				return;
			}
			const attr = filtersMap[key];
			if (icon[attr] === void 0) {
				return;
			}

			const block = blocks[key];
			const active = block.active;
			const iconValue = icon[attr];

			(typeof iconValue === 'string' ? [iconValue] : iconValue).forEach(
				value => {
					if (value === active) {
						return;
					}
					if (block.filters[value] !== void 0) {
						filters.push({
							action: key,
							value: value,
							item: cloneObject(block.filters[value]),
						});
					}
				}
			);
		});

		// Icon sets
		if (route.type === 'search' && blocks.collections) {
			const prefix = item.icon.prefix;
			if (blocks.collections.filters[prefix]) {
				filters.push({
					action: 'collections',
					value: prefix,
					item: cloneObject(blocks.collections.filters[prefix]),
				});
			}
		}

		return filters;
	}

	// Filter icons
	let parsedIcons = [];
	$: {
		// Mention updateCounter to make sure this code is ran
		updateCounter;

		// Reset icons list
		let newParsedIcons = [];

		// Parse icons
		let pending = [];
		let selectedName = selectedIcon === null ? '' : iconToString(selectedIcon);

		// Map old icons
		const oldKeys = Object.create(null);
		parsedIcons.forEach(icon => {
			oldKeys[icon.name] = icon;
		});

		let updated = false;
		blocks.icons.icons.forEach(icon => {
			const name = iconToString(icon);
			const data = Iconify.getIcon(name);
			const exists = data !== null;

			// Tooltip
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

			// Link
			const providerData = getProvider(icon.provider);
			let link;
			if (providerData) {
				link = providerData.links.icon
					.replace('{prefix}', icon.prefix)
					.replace('{name}', icon.name);
			} else {
				link = '';
			}

			// Item
			let item = {
				name,
				text: showPrefix ? name : icon.name,
				tooltip,
				icon: cloneObject(icon),
				exists,
				link,
				selected: name === selectedName,
			};

			if (isList) {
				// Add filters
				item.filters = getFilters(item);
			}

			// Check if item has been updated, use old item if not to avoid re-rendering child component
			if (oldKeys[name] === void 0) {
				updated = true;
				if (!exists) {
					pending.push(name);
				}
			} else if (!compareObjects(oldKeys[name], item)) {
				updated = true;
			} else {
				item = oldKeys[name];
			}

			newParsedIcons.push(item);
		});

		// Load pending images
		if (pending.length) {
			if (abortLoader !== null) {
				abortLoader();
			}
			abortLoader = Iconify.loadIcons(pending, loadingEvent);
		}

		// Overwrite parseIcons variable only if something was updated, triggering component re-render
		// Also compare length in case if new set is subset of old set
		if (updated || parsedIcons.length !== newParsedIcons.length) {
			parsedIcons = newParsedIcons;
		}
	}

	// Icon or filter was clicked
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
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

<div class={baseClass + ' ' + baseClass + (isList ? '--list' : '--grid')}>
	<ul>
		{#each parsedIcons as item, i (item.name)}
			{#if isList}
				<IconList {...item} {onClick} {uncategorised} />
			{:else}
				<IconGrid {...item} {onClick} />
			{/if}
		{/each}
	</ul>
</div>
