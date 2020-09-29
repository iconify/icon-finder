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
		for (let i = 0; i < 4; i++) {
			if (list && list[i] && value !== i) {
				// Not selected and exists: keep old item to avoid re-render
				const oldItem = list[i];
				oldItem.selected = false;
				newList.push(oldItem);
			} else {
				// Update key to force re-render
				newList.push(
					addItem(
						i,
						value === i,
						list && list[i] ? list[i].temp + 1 : 0
					)
				);
			}
		}
		list = newList;
	}

	function addItem(count, selected, temp) {
		return {
			count,
			key: count + '-' + temp,
			selected,
			temp,
		};
	}

	function rotateClicked(count) {
		if (!count && !value) {
			return;
		}
		customise('rotate', count === value ? 0 : count);
	}
</script>

<Block type="rotate" {registry}>
	{#each list as { count, key }, i (key)}
		<Button
			icon={'rotate' + count}
			title={phrases.rotateTitle.replace('{num}', count * 90)}
			text={phrases.rotate.replace('{num}', count * 90)}
			status={value === count ? 'checked' : 'unchecked'}
			onClick={() => rotateClicked(count)} />
	{/each}
</Block>
