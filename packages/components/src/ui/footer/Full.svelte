<script context="module">
	// @iconify-replacement: 'canShowIconProperties = true'
	const canShowIconProperties = true;

	// @iconify-replacement: 'canShowIconCode = true'
	const canShowIconCode = true;
</script>

<script>
	import Block from '../Block.svelte';
	// @iconify-replacement: '/parts/name/Simple.svelte'
	import IconName from './parts/name/Simple.svelte';
	import ButtonsContainer from './parts/Buttons.svelte';
	// @iconify-replacement: './parts/Properties.svelte'
	import PropertiesContainer from './parts/Properties.svelte';
	// @iconify-replacement: './parts/Code.svelte'
	import CodeContainer from './parts/Code.svelte';
	import Sample from './parts/FullSample.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let selectedIcon; /** @type {Icon} */
	export let iconName; /** @type {string} */
	export let customise; /** @type {function} */
	export let iconCustomisations; /** @type {IconCustomisations} */
	export let route; /** @type {PartialRoute} */
	export let footerOptions; /** @type {object} */
</script>

{#if loaded | footerOptions.showButtons}
	<Block type="footer">
		<div class="iif-footer-full">
			<Sample
				{registry}
				{loaded}
				{iconName}
				{iconCustomisations}
				{footerOptions} />
			<div class="iif-footer-full-content">
				<IconName {registry} {iconName} {loaded} {selectedIcon} {route} />
				{#if canShowIconProperties && loaded}
					<PropertiesContainer
						{registry}
						{iconName}
						{customise}
						{iconCustomisations} />
				{/if}
				{#if canShowIconCode && loaded}
					<CodeContainer {registry} {iconName} {iconCustomisations} />
				{/if}
				{#if footerOptions.showButtons}
					<ButtonsContainer {registry} {loaded} {iconName} {footerOptions} />
				{/if}
			</div>
		</div>
	</Block>
{/if}
