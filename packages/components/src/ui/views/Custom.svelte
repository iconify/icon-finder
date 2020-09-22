<script>
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {PartialRoute} */
	export let route;
	/** @type {Icon | null} */
	export let selectedIcon;
	/** @type {CollectionViewBlocks | null} */
	export let blocks;

	/** @type {string} */
	let customType;
	$: {
		customType = route.params.customType;
	}
</script>

<div class="iif-view iif-view--custom iif-view--custom--{customType}">
	<SearchBlock {registry} name="filter" block={blocks.filter} {customType} />

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
