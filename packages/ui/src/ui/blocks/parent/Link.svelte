<script>
	import Icon from '../../misc/Icon.svelte';

	export let text; /** @param {string} */
	// export let level; /** @param {number} */
	export let onClick; /** @type {function} */
</script>

<div class="iif-parent-link">
	<Icon icon="parent" />
	<a href="# " on:click|preventDefault={onClick}>{text}</a>
</div>
