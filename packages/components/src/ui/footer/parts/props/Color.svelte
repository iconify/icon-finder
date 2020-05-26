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
	const title = registry.phrases.footerBlocks.color;
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

	// Convert color to valid string
	function getColor(value, defaultValue) {
		const color = colors.fromString(value);
		if (!color) {
			return defaultValue;
		}
		const keyword = color.toKeyword(false, true);
		if (keyword) {
			return keyword;
		}
		return color.toString({
			compress: true,
		});
	}

	// Check input
	function onInput(newValue) {
		inputValue = newValue;

		// Check for valid color
		if (newValue === '') {
			callback('prop', {
				prop: 'color',
				value: '',
			});
			return;
		}

		const validatedValue = getColor(newValue, null);
		if (validatedValue !== null) {
			// Change lastValue to avoid triggering component refresh
			lastValue = value = validatedValue;
			callback('prop', {
				prop: 'color',
				value: validatedValue,
			});
		}
	}

	// Reset to last valid value
	function onBlur() {
		// Set last value as input value
		inputValue = value;
	}
</script>

{#if hasColor}
	<Block type="color" {registry}>
		<Input
			value={inputValue}
			{placeholder}
			{title}
			{onInput}
			{onBlur}
			icon={value === '' ? 'color' : 'color-filled'}
			extra={value}
			type="color" />
	</Block>
{/if}
