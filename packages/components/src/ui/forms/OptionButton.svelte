<script context="module">
	const baseClass = 'iif-option-button';
</script>

<script>
	import Icon from '../misc/Icon.svelte';

	export let icon;
	export let onClick;
	export let title;
	export let text;
	export let status = '';

	let hasIcon = false;
	function iconLoaded() {
		hasIcon = true;
	}

	let className;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(hasIcon ? '--with-icon' : '--without-icon') +
			' ' +
			baseClass +
			(text || !hasIcon ? '--with-text' : '--without-text') +
			(status === '' ? '' : ' ' + baseClass + '--' + status);
	}
</script>

<button class={className} {title} on:click={onClick}>
	{#if icon}
		<Icon {icon} onLoad={iconLoaded} />
	{/if}
	<span>{text ? text : title}</span>
</button>
