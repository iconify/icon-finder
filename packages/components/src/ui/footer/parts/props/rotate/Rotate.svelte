<script>
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	export let registry; /** @type {Registry} */
	// export let iconData; /** @type {IconifyIcon} */
	// export let footerOptions; /** @type {object} */
	export let value; /** @type {string} */
	export let customise; /** @type {function} */

	const phrases = registry.phrases.footerOptionButtons;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	let list;
	$: {
		list = [];
		for (let i = 0; i < 4; i++) {
			list.push(addItem(i, value === i));
		}
	}

	function addItem(count, selected) {
		return {
			count: count,
			key: count + (selected ? '!' : ''),
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
