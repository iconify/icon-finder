<script context="module">
	// @iconify-replacement: '/misc/shorten-icon-name'
	import { shortenIconName } from '../../../../misc/shorten-icon-name';

	// @iconify-replacement: 'canShortenName = true'
	const canShortenName = true;
</script>

<script>
	import Icon from '../../../misc/Icon.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {string} */
	export let iconName;
	/** @type {Icon} */
	export let selectedIcon;
	/** @type {PartialRoute} */
	export let route;

	/** @type {Record<string, string>} */
	const phrases = registry.phrases.footer;

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
</script>

{#if loaded}
	<div class="iif-footer-icon-name iif-footer-icon-name--simple">
		<dl>
			<dt>{phrases.iconName}</dt>
			<dd>
				<Icon icon={iconName} />
				<div class="iif-footer-icon-name-input">
					<span>{text}</span>
				</div>
			</dd>
		</dl>
	</div>
{/if}
