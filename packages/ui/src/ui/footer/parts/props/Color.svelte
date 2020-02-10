<script>
	import colors from 'cyberalien-color';
	import Input from '../../../forms/Input.svelte';
	import Block from './Block.svelte';

	export let registry; /** @type {Registry} */
	export let iconData; /** @type {IconifyIcon} */
	// export let footerOptions; /** @type {object} */
	export let value; /** @type {string} */

	let hasColor;
	$: {
		hasColor = iconData.body.indexOf('currentColor') !== -1;
	}

	const placeholder = registry.defaultProps.color.defaultValue;
	const callback = registry.callback;

	let lastValue = value;
	let inputValue = value;
	$: {
		// Change inputValue when value changes
		if (lastValue !== value) {
			lastValue = value;
			inputValue = value;
		}
	}

	// Check input
	function onInput(newValue) {
		inputValue = newValue;

		// Check for valid color
		let validatedValue;
		if (newValue === '') {
			validatedValue = '';
		} else {
			const color = colors.fromString(newValue);
			validatedValue = color ? newValue : null;
		}
		if (validatedValue !== null) {
			callback('prop', {
				prop: 'color',
				value: validatedValue,
			});
		}
	}

	// Reset to last valid value
	function onBlur() {
		if (value === '') {
			inputValue = value;
			return;
		}

		const color = colors.fromString(value);
		if (color) {
			const keyword = color.toKeyword(false, true);
			const newValue =
				keyword === false
					? color.toString({
							format: 'hex',
							compress: true,
					  })
					: keyword;
			if (newValue !== inputValue) {
				callback('prop', {
					prop: 'color',
					value: newValue,
				});
			}
		}
	}
</script>

{#if hasColor}
	<Block type="color" {registry}>
		<Input
			value={inputValue}
			{placeholder}
			{onInput}
			{onBlur}
			icon="color"
			type="color" />
	</Block>
{/if}
