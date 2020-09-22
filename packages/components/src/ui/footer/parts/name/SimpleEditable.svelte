<script>
	import Iconify from '@iconify/iconify';
	import { onDestroy } from 'svelte';
	import Icon from '../../../misc/Icon.svelte';
	import Input from '../../../forms/Input.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	// export let loaded;
	/** @type {Icon} */
	// export let selectedIcon;
	/** @type {string} */
	export let iconName;
	/** @type {PartialRoute} */
	// export let route;
	/** @type {object} */
	// export let footerOptions;

	/** @type {Record<string, string>} */
	const phrases = registry.phrases.footer;

	let value = iconName;
	let lastIconName = iconName;
	$: {
		// Copy icon name if it was changed
		if (lastIconName !== iconName) {
			lastIconName = iconName;
			value = iconName;
		}

		// Check for icon
		if (
			value !== lastIconName &&
			(value === '') | Iconify.iconExists(value)
		) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
			});
		}
	}

	// Event listener
	let loadingIconName = '';
	/** @type {function | null} */
	let abortLoader = null;
	const loadingEvent = () => {
		if (
			lastIconName !== loadingIconName &&
			lastIconName !== value &&
			Iconify.iconExists(loadingIconName)
		) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: loadingIconName,
			});
		}
	};

	// Test new icon name
	function testNewValue() {
		// Check if value is a valid icon name
		if (value.indexOf('-') === -1 && value.indexOf(':') === -1) {
			value = lastIconName;
			return;
		}

		// Check if icon already exists
		if (Iconify.iconExists(value)) {
			// UISelectionEvent
			registry.callback({
				type: 'selection',
				icon: value,
			});
			return;
		}

		// Attempt to load icon from API
		loadingIconName = value;
		if (abortLoader !== null) {
			abortLoader();
		}
		abortLoader = Iconify.loadIcons([loadingIconName], loadingEvent);
	}

	// Remove event listener
	onDestroy(() => {
		if (abortLoader !== null) {
			abortLoader();
			abortLoader = null;
		}
	});
</script>

<form
	on:submit|preventDefault={testNewValue}
	class="iif-footer-icon-name iif-footer-icon-name--simple
		iif-footer-icon-name--simple--editable">
	<dl>
		<dt>{phrases.iconName}</dt>
		<dd>
			{#if lastIconName !== ''}
				<Icon icon={lastIconName} />
			{/if}
			<Input
				bind:value
				onBlur={testNewValue}
				placeholder={phrases.iconNamePlaceholder} />
		</dd>
	</dl>
</form>
