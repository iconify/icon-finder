<script>
	import Block from './Block.svelte';
	import Button from '../../../forms/OptionButton.svelte';

	export let registry; /** @type {Registry} */
	// export let iconData; /** @type {IconifyIcon} */
	export let iconProps; /** @type {PartialIconProperties} */

	const defaultProps = registry.defaultProps;
	const phrases = registry.phrases.footerOptionButtons;

	const list = ['hFlip', 'vFlip'];

	// Toggle
	function flipClicked(type) {
		registry.callback('prop', {
			prop: type,
			value: !iconProps[type],
		});
	}
</script>

<Block type="flip" {registry}>
	{#each list as type, i (type)}
		<Button
			icon={type}
			title={phrases[type]}
			status={iconProps[type] ? 'checked' : 'unchecked'}
			onClick={() => flipClicked(type)} />
	{/each}
</Block>
