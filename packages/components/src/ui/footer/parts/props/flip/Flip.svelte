<script>
	import Block from '../Block.svelte';
	import Button from '../../../../forms/OptionButton.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {IconifyIcon} */
	// export let iconData;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {function} */
	export let customise;

	/** @type {Record<string, string>} */
	const phrases = registry.phrases.footerOptionButtons;

	// Dynamically generate list of icons, using keys to force redrawing button, triggering css animation
	let list;
	$: {
		list = [
			addItem('h', iconCustomisations.hFlip),
			addItem('v', iconCustomisations.vFlip),
		];
	}

	function addItem(key, selected) {
		return {
			type: key + 'Flip',
			icon: key + '-flip',
			key: key + 'Flip' + (selected ? '!' : ''),
		};
	}

	// Toggle
	function flipClicked(type) {
		customise(type, !iconCustomisations[type]);
	}
</script>

<Block type="flip" {registry}>
	{#each list as { type, key, icon }, i (key)}
		<Button
			{icon}
			title={phrases[type]}
			status={iconCustomisations[type] ? 'checked' : 'unchecked'}
			onClick={() => flipClicked(type)} />
	{/each}
</Block>
