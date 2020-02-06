<script>
	import Icon from '../../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let iconName; /** @type {string} */
	export let footerOptions; /** @type {object} */

	const buttons = footerOptions.buttons;
	const items = Object.keys(buttons).map(key => {
		let button = buttons[key];

		return {
			key,
			className: 'iif-form-button iif-form-button--' + button.type,
			...button,
		};
	});

	function onClick(key) {
		registry.callback('footer', key);
	}
</script>

<div class="iif-footer-buttons">
	{#each items as item, i (item.key)}
		{#if loaded || item.always}
			<button class={item.className} on:click={onClick.bind(this, item.key)}>
				{#if item.icon}
					<Icon icon={item.icon} />
				{/if}
				{item.text.replace('{icon}', iconName)}
			</button>
		{/if}
	{/each}
</div>
