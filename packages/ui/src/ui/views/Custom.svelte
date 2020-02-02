<script>
	import FiltersBlock from '../blocks/Filters.svelte';
	import IconsWithPages from '../blocks/IconsWithPages.svelte';
	import SearchBlock from '../blocks/Search.svelte';

	export let registry; /** @type {Registry} */
	export let route; /** @type {PartialRoute} */
	export let selectedIcon; /** @type {Icon | null} */
	export let blocks; /** @type {CollectionViewBlocks | null} */

	let customType; /** @type {string} */
	$: {
		customType = route.params.customType;
	}
</script>

<div class="iif-view iif-view--custom iif-view--custom--{customType}">
	<SearchBlock {registry} name="filter" block={blocks.filter} />

	<IconsWithPages {registry} {blocks} {selectedIcon} {route} />
</div>
