<script>
	import Icon from '../../misc/Icon.svelte';

	/** @type {string} */
	export let text;
	/** @type {number} */
	// export let level;
	/** @type {function} */
	export let onClick;
</script>

<div class="iif-parent-link">
	<Icon icon="parent" />
	<a href="# " on:click|preventDefault={onClick}>{text}</a>
</div>
