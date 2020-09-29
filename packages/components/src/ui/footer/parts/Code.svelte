<script>
	import FiltersBlock from '../../blocks/Filters.svelte';
	import CodeSample from './CodeSample.svelte';
	import { getActiveProvider } from '../../../misc/get-provider';
	import { codeConfig } from '../../../misc/code-config';
	import { getCodeTree, filterCodeTabs } from '../../../misc/code-tree';

	/** @type {Registry} */
	export let registry;
	/** @type {PartialRoute} */
	export let route;
	/** @type {string} */
	export let iconName;
	/** @type {IconCustomisations} */
	export let iconCustomisations;

	/** @type {UITranslation} */
	const phrases = registry.phrases;
	/** @type {ComponentsConfig} */
	const componentsConfig = registry.config.components;

	// Get list of all code tabs
	/** @type {ProviderCodeData} */
	let providerConfig;
	/** @type {FilteredCodeTabs} */
	let codeTabs;
	/** @type {string} */
	$: {
		/** @type {string} */
		let provider = getActiveProvider(route);
		providerConfig =
			codeConfig.providers[provider] === void 0
				? codeConfig.defaultProvider
				: codeConfig.providers[provider];
		codeTabs = getCodeTree(providerConfig, phrases);
	}

	// Selected tab
	/** @type {string} */
	let currentTab = componentsConfig.codeTab;
	/** @type {FilteredCodeSelection} */
	let selection;
	/** @type {FiltersBlock | null} */
	let childFiltersBlock;
	/** @type {string} */
	let childTabsTitle;
	$: {
		selection = filterCodeTabs(codeTabs, currentTab);

		// Update tabs
		const key = selection.root.key;
		codeTabs.filters.active = key;
		if (selection.child && codeTabs.childFilters[key]) {
			// Child tab: update active tab and get title
			childFiltersBlock = codeTabs.childFilters[key];
			childFiltersBlock.active = selection.child.key;
			childTabsTitle =
				phrases.code.childTabTitles[key] === void 0
					? phrases.code.childTabTitle.replace('{key}', key)
					: phrases.code.childTabTitles[key];
		} else {
			childFiltersBlock = null;
			childTabsTitle = '';
		}
	}

	// Change current tab
	function changeTab(tab) {
		componentsConfig.codeTab = tab;
		currentTab = tab;

		// UIConfigEvent
		registry.callback({
			type: 'config',
		});
	}
</script>

{#if codeTabs.tree.length}
	<div class="iif-code">
		<p class="iif-code-heading">
			{phrases.code.heading.replace('{name}', iconName.split(':').pop())}
		</p>

		<div class="iif-filters">
			<FiltersBlock
				{registry}
				name="code"
				block={codeTabs.filters}
				onClick={changeTab} />
			{#if childFiltersBlock}
				<FiltersBlock
					{registry}
					name="code"
					block={childFiltersBlock}
					onClick={changeTab}
					title={childTabsTitle} />
			{/if}
		</div>

		<CodeSample
			{registry}
			mode={selection.active.key}
			title={selection.active.title}
			{iconName}
			{iconCustomisations}
			{providerConfig} />
	</div>
{/if}
