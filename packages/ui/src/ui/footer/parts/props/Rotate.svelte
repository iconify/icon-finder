<script>
	import Block from './Block.svelte';
	import Button from '../../../forms/OptionButton.svelte';

	export let registry; /** @type {Registry} */
	// export let iconData; /** @type {IconifyIcon} */
	// export let footerOptions; /** @type {object} */
	export let value; /** @type {string} */

	const phrases = registry.phrases.footerOptionButtons;
	const list = [0, 1, 2, 3];

	function rotateClicked(count) {
		if (!count && !value) {
			return;
		}
		registry.callback('prop', {
			prop: 'rotate',
			value: count === value ? 0 : count,
		});
	}
</script>

<Block type="rotate" {registry}>
	{#each list as count, i (count)}
		<Button
			icon={'rotate' + count}
			title={phrases.rotateTitle.replace('{num}', count * 90)}
			text={phrases.rotate.replace('{num}', count * 90)}
			status={value === count ? 'checked' : 'unchecked'}
			onClick={() => rotateClicked(count)} />
	{/each}
</Block>
