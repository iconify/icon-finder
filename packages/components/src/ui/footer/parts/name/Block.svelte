<script context="module">
	// @iconify-replacement: '/misc/shorten-icon-name'
	import { shortenIconName } from '../../../../misc/shorten-icon-name';

	// @iconify-replacement: 'canShortenName = true'
	const canShortenName = true;
</script>

<script>
	import Iconify from '@iconify/iconify';
	import Icon from '../../../misc/Icon.svelte';
	import { getIconGrid } from '../../../../misc/scale-icon';

	/** @type {Registry} */
	// export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {string} */
	export let iconName;
	/** @type {Icon} */
	export let selectedIcon;
	/** @type {PartialRoute} */
	export let route;

	/** @type {string} */
	let text;
	$: {
		// Do not show prefix if viewing collection
		if (canShortenName) {
			text = shortenIconName(route, selectedIcon, iconName);
		}
		if (!canShortenName) {
			text = iconName;
		}
	}

	// Get icon data and grid
	/** @type {IconifyIcon | null} */
	let iconData;
	/** @type {number} */
	let grid;
	$: {
		onLoad();
	}

	function onLoad() {
		iconData = Iconify.getIcon(iconName);
		if (!iconData || !iconData.height) {
			grid = 0;
			return;
		}

		grid = getIconGrid(iconData.height);
	}

	// Get sample class name
	/** @type {string} */
	let className;
	$: {
		className = 'iif-footer-small-sample iif-footer-small-sample--' + grid;
	}
</script>

{#if loaded}
	<div class="iif-footer-icon-name iif-footer-icon-name--block">
		<div class={className}>
			<Icon icon={iconName} {onLoad} />
		</div>
		<span>{text}</span>
	</div>
{/if}
