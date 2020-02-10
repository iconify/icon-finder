<script>
	import Block from './Block.svelte';
	import SizeInput from './SizeInput.svelte';

	export let registry; /** @type {Registry} */
	export let iconData; /** @type {IconifyIcon} */
	export let iconProps; /** @type {PartialIconProperties} */

	const defaultProps = registry.defaultProps;

	let type;
	let list;
	$: {
		type = defaultProps.width
			? defaultProps.height
				? 'size'
				: 'width'
			: 'height';
		list = defaultProps.width
			? defaultProps.height
				? ['width', 'height']
				: ['width']
			: ['height'];
	}
</script>

<Block {type} {registry}>
	{#each list as type, i (type)}
		<SizeInput
			{registry}
			{type}
			value={iconProps[type]}
			iconSize={iconData[type]} />
	{/each}
</Block>
