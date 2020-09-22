<script>
	import IconButton from '../../forms/IconButton.svelte';

	/** @type {string} */
	export let headerText;
	/** @type {boolean} */
	export let isList;
	/** @type {boolean} */
	export let canChangeLayout;
	/** @type {UITranslation} */
	export let phrases;
	/** @type {function} */
	export let changeLayout;
</script>

<div class="iif-icons-header">
	<div class="iif-icons-header-text">{headerText}</div>
	{#if canChangeLayout}
		<div class="iif-icons-header-modes">
			{#each [isList ? 'grid' : 'list'] as icon (icon)}
				<IconButton
					{icon}
					onClick={changeLayout}
					title={phrases.icons.header[icon + 'Mode']} />
			{/each}
		</div>
	{/if}
</div>
