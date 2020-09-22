<script>
	import colors from 'cyberalien-color';
	import Input from '../../../../forms/Input.svelte';
	import Block from '../Block.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {IconifyIcon} */
	export let iconData;
	/** @type {object} */
	// export let footerOptions;
	/** @type {string} */
	export let value;
	/** @type {function} */
	export let customise;

	// @iconify-replacement: 'defaultColor = '''
	const defaultColor = '';

	/** @type {boolean} */
	let hasColor;
	$: {
		hasColor = iconData.body.indexOf('currentColor') !== -1;
	}

	/** @type {string} */
	const title = registry.phrases.footerBlocks.color;

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
			customise('color', '');
			return;
		}

		const validatedValue = getColor(newValue, null);
		if (validatedValue !== null) {
			// Change lastValue to avoid triggering component refresh
			lastValue = value = validatedValue;
			customise('color', validatedValue);
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
			placeholder={defaultColor}
			{title}
			{onInput}
			{onBlur}
			icon={value === void 0 || value === '' ? 'color' : 'color-filled'}
			extra={value === void 0 ? '' : value}
			type="color" />
	</Block>
{/if}
