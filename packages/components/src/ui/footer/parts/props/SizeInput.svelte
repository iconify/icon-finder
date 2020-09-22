<script>
	import Input from '../../../forms/Input.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let type;
	/** @type {string} */
	export let value;
	/** @type {string} */
	export let placeholder;
	/** @type {function} */
	export let customise;

	/** @type {string} */
	const title = registry.phrases.footerBlocks[type];

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

		let num = newValue === '' ? '' : parseFloat(newValue);
		if (!isNaN(num) && '' + num === newValue) {
			customise(type, '' + num);
		}
	}

	// Reset to last valid value
	function onBlur() {
		inputValue = value;
	}
</script>

<Input
	value={inputValue}
	{placeholder}
	{title}
	{onInput}
	{onBlur}
	icon={'icon-' + type}
	type="number" />
