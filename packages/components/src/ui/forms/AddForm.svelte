<script>
	import Input from '../forms/Input.svelte';
	import Icon from '../misc/Icon.svelte';

	// export let registry; /** @type {Registry} */
	export let phrases;
	export let buttonIcon; /** @type {string} */
	export let inputIcon; /** @type {string} */
	export let value; /** @type {string} */
	export let onSubmit; /** @type {function} */
	export let onValidate; /** @type {function} */
	export let status; /** @type {string} */

	let valid;
	$: {
		valid = validateValue(value);
	}

	/**
	 * Validate current value
	 */
	function validateValue(value) {
		if (typeof onValidate === 'function') {
			return onValidate(value);
		}
		return true;
	}

	/**
	 * Submit form
	 */
	function submitForm() {
		onSubmit(value);
	}
</script>

<div class="iif-block--add-form">
	{#if phrases.title}
		<div class="iif-block--add-form-title">{phrases.title}</div>
	{/if}
	<form on:submit|preventDefault={submitForm} class="iif-block--add-form-form">
		<Input
			type="text"
			bind:value
			placeholder={phrases.placeholder}
			bind:icon={inputIcon} />
		<button class="iif-form-button iif-form-button--primary" type="submit">
			{#if buttonIcon}
				<Icon icon="plus" />
			{/if}
			{phrases.submit}
		</button>
	</form>
	{#if status}
		<div class="iif-block--add-form-status">{status}</div>
	{/if}
	{#if !valid && phrases.invalid}
		<div class="iif-block--add-form-invalid">{phrases.invalid}</div>
	{/if}
</div>
