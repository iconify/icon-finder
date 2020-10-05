<script>
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {IconifyIcon} */
	// export let iconData;
	/** @type {object} */
	// export let footerOptions;
	/** @type {string} */
	export let value;
	/** @type {function} */
	export let customise;

	/** @type {Record<string, string>} */
	const phrases = registry.phrases.footerOptionButtons;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	let list;
	$: {
		const newList = [];
		for (let i = 0; i < 2; i++) {
			const inline = !!i;
			if (list && list[i] && value !== inline) {
				// Not selected and exists: keep old item to avoid re-render
				const oldItem = list[i];
				oldItem.selected = false;
				newList.push(oldItem);
			} else {
				// Update key to force re-render
				newList.push(
					addItem(
						inline,
						value === inline,
						list && list[i] ? list[i].temp + 1 : 0
					)
				);
			}
		}
		list = newList;
	}

	function addItem(inline, selected, temp) {
		const mode = inline ? 'inline' : 'block';
		return {
			mode,
			inline,
			key: mode + temp,
			selected,
			temp,
		};
	}

	function inlineClicked() {
		customise('inline', !value);
	}
</script>

<Block type="mode" {registry}>
	{#each list as { mode, inline, key }, i (key)}
		<Button
			icon={'mode-' + mode}
			text={phrases[mode]}
			title={phrases[mode + 'Hint']}
			status={value === inline ? 'checked' : 'unchecked'}
			textOptional={true}
			onClick={inlineClicked} />
	{/each}
</Block>
