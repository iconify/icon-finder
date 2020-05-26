<script>
	export let registry; /** @type {Registry} */
	export let type; /** @type {string} */

	const phrases = registry.phrases.footerBlocks;

	let title;
	$: {
		title =
			phrases[type] === void 0
				? type
						.split(' ')
						.map(str => str.slice(0, 1).toUpperCase() + str.slice(1))
						.join(' ')
				: phrases[type];
	}
</script>

<div class="iif-footer-options-block">
	<p>{title}</p>
	<div>
		<slot />
	</div>
</div>
