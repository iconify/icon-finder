<script context="module">
	// @iconify-replacement: 'maxIndex = 10'
	const maxIndex = 10;
	const baseClass = 'iif-tabs';
	const baseItemClass = 'iif-tab';
</script>

<script>
	import Icon from './Icon.svelte';

	export let tabs; /** @type {Tab[]} */
	export let selected; /** @type {string} */
	export let onClick; /** @type {function} */

	let list = [];
	$: {
		const leftList = [];
		const rightList = [];
		tabs.forEach(tab => {
			const key = tab.key;
			const index =
				(typeof tab.index === void 0 ? list.length : tab.index) % maxIndex;

			// Generate class name
			const className =
				baseItemClass +
				' ' +
				baseItemClass +
				'--' +
				index +
				(key === selected ? ' ' + baseItemClass + '--selected' : '') +
				(tab.type ? ' ' + baseItemClass + '--' + tab.type : '');

			// Generate item
			const item = {
				key,
				className,
				title: tab.title,
				index,
				href: tab.href === void 0 ? '# ' : tab.href,
				icon: tab.icon,
				hint: tab.hint,
				onClick: tab.onClick === void 0 ? () => onClick(key) : tab.onClick,
			};

			if (tab.right) {
				rightList.push(item);
			} else {
				leftList.push(item);
			}
		});

		list = [
			{
				side: 'left',
				items: leftList,
				empty: !leftList.length,
			},
			{
				side: 'right',
				items: rightList,
				empty: !rightList.length,
			},
		];
	}
</script>

<div class={baseClass}>
	{#each list as listItem, i (listItem.side)}
		{#if !listItem.empty}
			<div class={baseClass + '-' + listItem.side}>
				{#each listItem.items as tab, j (tab.key)}
					<a
						href={tab.href}
						class={tab.className}
						title={tab.hint}
						on:click|preventDefault={tab.onClick}>
						{#if tab.icon}
							<Icon icon={tab.icon} />
						{/if}
						{#if tab.title !== ''}{tab.title}{/if}
					</a>
				{/each}
			</div>
		{/if}
	{/each}
</div>
