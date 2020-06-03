<script>
	import Block from '../Block.svelte';
	import Link from './parent/Link.svelte';

	export let registry; /** @type {Registry} */
	export let route; /** @type {PartialRoute} */

	const phrases = registry.phrases.parent; /** @type {Record<string, string>} */
	const collections = registry.collections; /** @type {CollectionsData} */

	function handleClick(level) {
		registry.router.action('parent', level);
	}

	let entries;
	$: {
		function addEntry(route, level) {
			// Default text: "default"
			let text = phrases.default;

			if (
				route.type === 'custom' &&
				phrases[route.params.customType] !== void 0
			) {
				// Text for custom view
				text = phrases[route.params.customType];
			} else if (phrases[route.type] !== void 0) {
				// Text for view type
				text = phrases[route.type];
				switch (route.type) {
					case 'collection':
						text = text.replace(
							'{name}',
							collections.info(route.params.prefix)
						);
						break;
				}
			}

			entries.unshift({
				level,
				route,
				text,
			});
			if (route.parent !== void 0) {
				addEntry(route.parent, level + 1);
			}
		}
		entries = [];
		if (route !== null && route.parent !== void 0) {
			addEntry(route.parent, 1);
		}

		// Add unique key to avoid re-rendering items
		entries = entries.map((item, index) => {
			let key = item.route.type + '-' + index + '-';
			switch (item.route.type) {
				case 'collection':
					key += item.route.params.provider + ':' + item.route.params.prefix;
					break;

				case 'custom':
					key += item.route.params.customType;
					break;
			}
			item.key = key;
			return item;
		});
	}
</script>

{#if entries.length > 0}
	<Block type="parent">
		{#each entries as item, i (item.key)}
			<Link
				text={item.text}
				level={item.level}
				onClick={() => handleClick(item.level)} />
		{/each}
	</Block>
{/if}
