<script>
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	export let registry; /** @type {Registry} */
	// export let iconData; /** @type {IconifyIcon} */
	export let iconCustomisations; /** @type {IconCustomisations} */
	export let customise; /** @type {function} */

	const phrases = registry.phrases.footerOptionButtons;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	let list;
	$: {
		list = [
			addItem('hFlip', iconCustomisations.hFlip),
			addItem('vFlip', iconCustomisations.vFlip),
		];
	}

	function addItem(type, selected) {
		return {
			type: type,
			key: type + (selected ? '!' : ''),
		};
	}

	// Toggle
	function flipClicked(type) {
		customise(type, !iconCustomisations[type]);
	}
</script>

<Block type="flip" {registry}>
	{#each list as { type, key }, i (key)}
		<Button
			icon={type}
			title={phrases[type]}
			status={iconCustomisations[type] ? 'checked' : 'unchecked'}
			onClick={() => flipClicked(type)} />
	{/each}
</Block>
