<script context="module">
	const baseClass = 'iif-page';
	const selectedClass = baseClass + ' ' + baseClass + '--selected';
	const arrowClass =
		baseClass + ' ' + baseClass + '--arrow ' + baseClass + '--';
	const moreClass = baseClass + ' ' + baseClass + '--more';
</script>

<script>
	import { showPagination } from '../../../../core/lib/blocks/pagination';
	import Icon from '../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let name; /** @type {string} */
	export let block; /** @type {PaginationBlock} */

	let pages = [];
	let prevPage;
	let nextPage;
	$: {
		pages = showPagination(block);
		if (pages.length) {
			// Get previous / next pages
			nextPage = block.more
				? block.page + 1
				: pages[pages.length - 1] > block.page
				? block.page + 1
				: -1;
			prevPage = block.page > 0 ? block.page - 1 : -1;

			// Map pages
			pages = pages.map((page, index) => {
				const dot = index > 0 && pages[index - 1] < page - 1;
				return {
					dot,
					page,
					text: page + 1,
					className: page === block.page ? selectedClass : baseClass,
					onClick: () => setPage(page),
				};
			});
		}
	}

	// Change page
	function setPage(page) {
		registry.router.action(name, page);
	}
</script>

{#if pages.length > 0}
	<div class="iif-pagination">
		{#if prevPage !== -1}
			<a
				href="# "
				class={arrowClass + 'prev'}
				on:click|preventDefault={() => setPage(prevPage)}>
				<Icon icon="left" />
			</a>
		{/if}
		{#each pages as page}
			{#if page.dot}
				<span>...</span>
			{/if}
			<a
				href="# "
				class={page.className}
				on:click|preventDefault={page.onClick}>
				{page.text}
			</a>
		{/each}
		{#if block.more}
			<a
				href="# "
				class={moreClass}
				on:click|preventDefault={() => setPage(registry.phrases.icons.moreAsNumber ? 2 : 'more')}>
				{registry.phrases.icons.more}
			</a>
		{/if}
		{#if nextPage !== -1}
			<a
				href="# "
				class={arrowClass + 'next'}
				on:click|preventDefault={() => setPage(nextPage)}>
				<Icon icon="right" />
			</a>
		{/if}
	</div>
{/if}
