<script context="module">
	// @iconify-replacement: '/misc/shorten-icon-name'
	import { shortenIconName } from '../../../../misc/shorten-icon-name';

	// @iconify-replacement: 'canShortenName = true'
	const canShortenName = true;
</script>

<script>
	import Icon from '../../../misc/Icon.svelte';

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
