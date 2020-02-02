<script>
	import IconButton from '../../forms/IconButton.svelte';

	export let headerText; /** @type {string} */
	export let isList; /** @type {boolean} */
	export let canChangeLayout; /** @type {boolean} */
	export let phrases; /** @type {UITranslation} */
	export let changeLayout; /** @type {function} */
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
