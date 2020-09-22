<script>
	import Block from '../Block.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	// export let name;
	/** @type {CollectionInfoBlock | null} */
	export let block;

	/** @type {Record<string, string>} */
	const phrases = registry.phrases.collectionInfo;

	/** @type {CollectionInfo | null} */
	let info;
	$: {
		info = block !== null ? block.info : null;
	}
</script>

{#if info !== null}
	<Block type="collection-info">
		<div class="iif-collection-info-title">{info.name}</div>
		{#if info.author}
			<dl>
				<dt>{phrases.author}</dt>
				<dd>
					{#if info.author.url}
						<a
							href={info.author.url}
							target="_blank">{info.author.name}</a>
					{:else}{info.author.name}{/if}
				</dd>
			</dl>
		{/if}
		{#if info.license}
			<dl>
				<dt>{phrases.license}</dt>
				<dd>
					{#if info.license.url}
						<a
							href={info.license.url}
							target="_blank">{info.license.title}</a>
					{:else}{info.license.title}{/if}
				</dd>
			</dl>
		{/if}
		<dl>
			<dt>{phrases.total}</dt>
			<dd>{info.total}</dd>
		</dl>
		{#if info.height && info.showHeight !== false}
			<dl>
				<dt>{phrases.height}</dt>
				<dd>
					{typeof info.height === 'object' ? info.height.join(', ') : info.height}
				</dd>
			</dl>
		{/if}
	</Block>
{/if}
