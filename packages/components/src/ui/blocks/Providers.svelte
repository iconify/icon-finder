<script context="module">
	// @iconify-replacement: 'maxIndex = 10'
	const maxIndex = 10;
	// @iconify-replacement: 'canAddProviders = false'
	const canAddProviders = false;

	const baseProviderClass = 'iif-provider';
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import Block from '../Block.svelte';
	import AddForm from '../forms/AddForm.svelte';
	import Icon from '../misc/Icon.svelte';
	import { validateProvider, retrieveProvider } from '../../misc/add-provider';

	/**
	 * Global exports
	 */
	export let registry; /** @type {Registry} */
	// export let route; /** @type {PartialRoute} */
	export let activeProvider; /** @type {string} */
	export let providers; /** @type {string[]} */

	const phrases = registry.phrases.providers;

	let formVisible = false;
	let status = '';

	/**
	 * Select new provider
	 */
	function handleClick(key) {
		formVisible = false;
		registry.router.action('provider', key);
	}

	/**
	 * Show form
	 */
	function toggleForm() {
		formVisible = true;
	}

	/**
	 * Validate possible new provider
	 */
	function validateForm(value) {
		if (status !== '') {
			// Reset status on input change
			status = '';
		}
		return validateProvider(value) !== null;
	}

	/**
	 * Submit new provider
	 */
	function submitForm(value) {
		const host = validateProvider(value);
		if (!host) {
			return;
		}
		status = phrases.status.loading.replace('{host}', host);
		retrieveProvider(registry, host, (host, success, provider) => {
			if (!success) {
				// Use provider as error message
				status = phrases.status[provider].replace('{host}', host);
				return;
			}
			status = '';
			handleClick(provider);
		});
	}

	let list;
	$: {
		list = [];
		providers.forEach((provider, index) => {
			const item = getProvider(provider);
			if (item) {
				const className =
					baseProviderClass +
					(activeProvider === provider
						? ' ' + baseProviderClass + '--selected '
						: ' ') +
					baseProviderClass +
					'--' +
					(index % maxIndex);
				list.push({
					provider,
					title: item.title,
					className,
				});
			}
		});
	}
</script>

<Block type="providers">
	<div class="iif-providers-list">
		{#each list as provider, i (provider.provider)}
			<button
				class={provider.className}
				on:click|preventDefault={() => handleClick(provider.provider)}>
				{provider.title}
			</button>
		{/each}
		{#if canAddProviders && !formVisible}
			<button
				class={baseProviderClass + ' ' + baseProviderClass + '--add ' + baseProviderClass + '--' + ((list.length + 1) % maxIndex)}
				on:click|preventDefault={toggleForm}>
				<Icon icon="plus" />
				{phrases.add}
			</button>
		{/if}
	</div>
	{#if formVisible}
		<AddForm
			{registry}
			phrases={phrases.addForm}
			inputIcon="link"
			buttonIcon="plus"
			value=""
			onValidate={validateForm}
			onSubmit={submitForm}
			{status} />
	{/if}
</Block>
