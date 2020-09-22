<script>
	import Icon from '../misc/Icon.svelte';

	/** @type {string} */
	export let icon;
	/** @type {string} */
	export let title;
	/** @type {function} */
	export let onClick;
</script>

<button class="iif-icon-button" {title} on:click={onClick}>
	<Icon {icon} />
</button>
