<script context="module">
	const baseClass = 'iif-input';
</script>

<script>
	import { onMount } from 'svelte';
	import Icon from '../misc/Icon.svelte';

	export let placeholder = '';
	export let value = '';
	export let disabled = false;
	export let icon = '';
	export let type = '';
	export let onInput;
	export let onBlur;
	export let autofocus = false;

	let hasIcon = false;
	function iconLoaded() {
		hasIcon = true;
	}

	// Get container class name
	let className;
	$: {
		className =
			baseClass +
			// Placeholder
			' ' +
			baseClass +
			'--with' +
			(placeholder === '' ? 'out' : '') +
			'-placeholder' +
			// Icon
			(hasIcon ? ' ' + baseClass + '--with-icon' : '') +
			// Type
			(type !== '' ? ' ' + baseClass + '--' + type : '') +
			// Disabled
			(disabled ? ' ' + baseClass + '--disabled' : '');
	}

	// Reset value
	function resetValue() {
		value = '';
		handleInput();
	}

	// on:input binding as onInput
	function handleInput() {
		if (typeof onInput === 'function') {
			onInput(value);
		}
	}

	// on:blur binding as onBlur
	function handleBlur() {
		if (typeof onBlur === 'function') {
			onBlur(value);
		}
	}

	// Focus
	let inputRef;
	onMount(() => {
		if (autofocus) {
			inputRef.focus();
		}
	});
</script>

<div class="iif-input-wrapper">
	<div class={className}>
		{#if icon !== ''}
			<div class="iif-input-icon">
				<Icon {icon} onLoad={iconLoaded} />
			</div>
		{/if}
		<input
			type="text"
			title={placeholder}
			bind:value
			on:input={handleInput}
			on:blur={handleBlur}
			spellcheck="false"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			bind:this={inputRef} />
		{#if value === '' && placeholder !== ''}
			<div class="iif-input-placeholder">{placeholder}</div>
		{/if}
		{#if value !== ''}
			<a class="iif-input-reset" href="# " on:click|preventDefault={resetValue}>
				<Icon icon="reset" />
			</a>
		{/if}
	</div>
</div>
