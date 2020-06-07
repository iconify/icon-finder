<script context="module">
	// @iconify-replacement: 'maxIndex = 10'
	const maxIndex = 10;
	// @iconify-replacement: 'canAddProviders = false'
	const canAddProviders = false;

	const baseProviderClass = 'iif-provider';
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import Tabs from '../misc/Tabs.svelte';
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
	 * Toggle form
	 */
	function toggleForm() {
		formVisible = !formVisible;
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
			formVisible = false;
			registry.router.action('provider', provider);
		});
	}

	let list;
	$: {
		list = [];
		providers.forEach((provider, index) => {
			const item = getProvider(provider);
			if (item) {
				list.push({
					key: provider,
					title: item.title,
					index,
				});
			}
		});

		if (canAddProviders) {
			list.push({
				key: 'add',
				title: '',
				hint: phrases.add,
				onClick: toggleForm,
				right: true,
				index: 0,
				type: 'icon',
				icon: formVisible ? 'reset' : 'plus',
			});
		}
	}
</script>

<Block type="providers">
	<Tabs tabs={list} selected={activeProvider} onClick={handleClick} />
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
