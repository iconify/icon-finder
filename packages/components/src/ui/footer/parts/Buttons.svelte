<script>
	import Icon from '../../misc/Icon.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {boolean} */
	export let loaded;
	/** @type {string} */
	export let iconName;
	/** @type {object} */
	export let footerOptions;

	const buttons = footerOptions.buttons;
	const items = Object.keys(buttons).map((key) => {
		let button = buttons[key];

		return {
			key,
			className:
				'iif-form-button' +
				(button.type ? ' iif-form-button--' + button.type : '') +
				(button.icon ? ' iif-form-button--with-icon' : ''),
			...button,
		};
	});

	function onClick(button) {
		// UIFooterButtonEvent
		registry.callback({
			type: 'button',
			button,
		});
	}
</script>

<div class="iif-footer-buttons">
	{#each items as item, i (item.key)}
		{#if loaded || item.always}
			<button
				class={item.className}
				on:click={onClick.bind(this, item.key)}>
				{#if item.icon}
					<Icon icon={item.icon} />
				{/if}
				{item.text.replace('{icon}', iconName)}
			</button>
		{/if}
	{/each}
</div>
