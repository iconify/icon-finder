<script context="module">
	// @iconify-replacement: 'canShortenName = true'
	const canShortenName = true;
</script>

<script>
	import Iconify from '@iconify/iconify';
	import Icon from '../../../misc/Icon.svelte';
	import { getIconGrid } from '../../../../misc/scale-icon';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let iconName; /** @type {string} */
	export let selectedIcon; /** @type {Icon} */
	export let route; /** @type {PartialRoute} */

	const phrases = registry.phrases.footer;

	let text;
	$: {
		// Do not show prefix if viewing collection
		if (canShortenName) {
			text =
				selectedIcon &&
				route &&
				route.type === 'collection' &&
				route.params.provider === selectedIcon.provider &&
				route.params.prefix === selectedIcon.prefix
					? selectedIcon.name
					: iconName;
		}
		if (!canShortenName) {
			text = iconName;
		}
	}

	// Get icon data and grid
	let iconData;
	let grid;
	$: {
		onLoad(iconName);
	}

	function onLoad() {
		iconData = Iconify.getIcon(iconName);
		if (!iconData) {
			grid = 0;
			return;
		}

		grid = getIconGrid(iconData.height);
	}

	// Get sample class name
	let className;
	$: {
		className = 'iif-footer-small-sample iif-footer-small-sample--' + grid;
	}
</script>

{#if loaded}
	<div class="iif-footer-icon-name iif-footer-icon-name--block">
		<div class={className}>
			<Icon icon={iconName} height="1em" {onLoad} />
		</div>
		<span>{text}</span>
	</div>
{/if}
