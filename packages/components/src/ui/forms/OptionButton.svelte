<script context="module">
	const baseClass = 'iif-option-button';
</script>

<script>
	import Icon from '../misc/Icon.svelte';

	/** @type {string} */
	export let icon;
	/** @type {function} */
	export let onClick;
	/** @type {string} */
	export let title;
	/** @type {string} */
	export let text;
	/** @type {boolean} */
	export let textOptional = false;
	/** @type {string} */
	export let status = '';

	let hasIcon = false;
	function iconLoaded() {
		hasIcon = true;
	}

	/** @type {string} */
	let className;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			(hasIcon ? '--with-icon' : '--without-icon') +
			' ' +
			baseClass +
			((text && !textOptional) || !hasIcon
				? '--with-text'
				: '--without-text') +
			(status === '' ? '' : ' ' + baseClass + '--' + status);
	}
</script>

<button class={className} {title} on:click={onClick}>
	{#if icon}
		<Icon {icon} onLoad={iconLoaded} />
	{/if}
	<span>{text ? text : title}</span>
</button>
