<script>
	import Block from '../Block.svelte';
	// @iconify-replacement: '/parts/name/Simple.svelte'
	import IconName from './parts/name/Simple.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';
	// @iconify-replacement: './parts/Properties.svelte'
	import PropertiesContainer from './parts/Properties.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let selectedIcon; /** @type {Icon} */
	export let iconName; /** @type {string} */
	export let iconProps; /** @type {PartialIconProperties} */
	export let route; /** @type {PartialRoute} */
	export let footerOptions; /** @type {object} */
</script>

{#if loaded | footerOptions.showButtons}
	<Block type="footer">
		<IconName {registry} {iconName} {loaded} {selectedIcon} {route} />
		{#if loaded}
			<PropertiesContainer {registry} {iconName} {iconProps} />
		{/if}
		<ButtonsContainer {registry} {loaded} {iconName} {footerOptions} />
	</Block>
{/if}
