<script>
	import Block from '../Block.svelte';
	import Icon from '../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let error; /** @type {string} */
	export let route; /** @type {PartialRoute} */

	const phrases = registry.phrases.errors;

	let text;
	let canReturn;
	$: {
		canReturn =
			route &&
			(route.type !== 'collections' ||
				route.parent ||
				(route.params && route.params.provider)) &&
			phrases.custom.home !== void 0;
		text =
			phrases.custom[error] === void 0
				? phrases.defaultError
				: phrases.custom[error];

		switch (error) {
			case 'not_found':
				text = text.replace(
					'{prefix}',
					route && route.type === 'collection'
						? '"' + route.params.prefix + '"'
						: ''
				);
				break;

			case 'bad_route':
				canReturn = phrases.custom.home !== void 0;
				break;
		}
	}

	function handleReturn() {
		const router = registry.router;
		if (route.type === 'collections') {
			// Return to default provider
			router.home('');
		} else {
			router.home();
		}
	}
</script>

{#each [error] as type (type)}
	<Block type="error" extra={'error--' + type}>
		<Icon icon={'error-' + type} />
		<p>
			{text}
			{#if canReturn}
				<br />
				<a href="# " on:click|preventDefault={handleReturn}>
					{phrases.custom.home}
				</a>
			{/if}
		</p>
	</Block>
{/each}
