<script context="module">
	// @iconify-replacement: 'canShowIconProperties = true'
	const canShowIconProperties = true;

	// @iconify-replacement: 'canShowIconCode = true'
	const canShowIconCode = true;

	// @iconify-replacement: 'customiseInline = true'
	const customiseInline = true;
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
	import InlineSample from './parts/InlineSample.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {Icon} */
	export let selectedIcon;
	/** @type {string} */
	export let iconName;
	/** @type {function} */
	export let customise;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {PartialRoute} */
	export let route;
	/** @type {object} */
	export let footerOptions;
</script>

{#if loaded | footerOptions.showButtons}
	<Block type="footer">
		<div class="iif-footer-full">
			{#if customiseInline && iconCustomisations.inline}
				<InlineSample
					{registry}
					{loaded}
					{iconName}
					{iconCustomisations}
					{footerOptions} />
			{:else}
				<Sample
					{registry}
					{loaded}
					{iconName}
					{iconCustomisations}
					{footerOptions} />
			{/if}
			<div class="iif-footer-full-content">
				<IconName
					{registry}
					{iconName}
					{loaded}
					{selectedIcon}
					{route} />
				{#if canShowIconProperties && loaded}
					<PropertiesContainer
						{registry}
						{iconName}
						{customise}
						{iconCustomisations} />
				{/if}
				{#if canShowIconCode && loaded}
					<CodeContainer
						{registry}
						{iconName}
						{iconCustomisations}
						{route} />
				{/if}
				{#if footerOptions.showButtons}
					<ButtonsContainer
						{registry}
						{loaded}
						{iconName}
						{footerOptions} />
				{/if}
			</div>
		</div>
	</Block>
{/if}
