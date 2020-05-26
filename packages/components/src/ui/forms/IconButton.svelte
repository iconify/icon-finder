<script>
	import Icon from '../misc/Icon.svelte';

	export let icon;
	export let title;
	export let onClick;
</script>

<button class="iif-icon-button" {title} on:click={onClick}>
	<Icon {icon} />
</button>
