<script>
	import ContentError from './errors/ContentError.svelte';
	import Block from '../Block.svelte';
	import IconsContainer from './icons/Container.svelte';
	import IconsHeader from './icons/Header.svelte';
	import PaginationBlock from './Pagination.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {PartialRoute} */
	export let route;
	/** @type {Icon | null} */
	export let selectedIcon;
	/** @type {ViewBlocks | null} */
	export let blocks;

	/** @type {UITranslation} */
	const phrases = registry.phrases;
	const componentsConfig = registry.config.components;

	// Generate header text
	function generateHeaderText() {
		const total = blocks.pagination.length,
			text = phrases.icons;

		if (blocks.pagination.more && total > 0) {
			// Search results with "more" button
			return text.header.full;
		}

		// Exact phrase for count
		if (text.headerWithCount[total] !== void 0) {
			return text.headerWithCount[total];
		}

		// Default
		return text.header.full;
	}

	// Check if block is empty and get header text
	/** @type {boolean} */
	let isEmpty;
	/** @type {string} */
	let headerText;
	$: {
		isEmpty =
			!blocks.pagination ||
			!blocks.icons ||
			blocks.icons.icons.length < 1;
		if (!isEmpty) {
			// Generate header text
			headerText = generateHeaderText().replace(
				'{count}',
				blocks.pagination.length
			);
		}
	}

	// Layout mode
	const canChangeLayout = componentsConfig.toggleList;
	let isList = componentsConfig.list;

	function changeLayout() {
		if (canChangeLayout) {
			isList = componentsConfig.list = !componentsConfig.list;
			// UIConfigEvent
			registry.callback({
				type: 'config',
			});
		}
	}
</script>

{#if isEmpty}
	<ContentError error={phrases.errors.noIconsFound} />
{:else}
	<Block type="icons">
		<IconsHeader
			{headerText}
			{isList}
			{canChangeLayout}
			{phrases}
			{changeLayout} />
		<IconsContainer {registry} {selectedIcon} {blocks} {route} {isList} />
		<PaginationBlock
			{registry}
			name="pagination"
			block={blocks.pagination} />
	</Block>
{/if}
