<script context="module">
	// @iconify-replacement: 'maxIndex = 10'
	const maxIndex = 10;

	// @iconify-replacement: 'authorLink = true'
	const authorLink = true;

	// @iconify-replacement: 'collectionClickable = false'
	const collectionClickable = false;

	const baseClass = 'iif-collection';

	function getSamplesHeight(info) {
		if (info.displayHeight) {
			return info.displayHeight;
		} else if (typeof info.height === 'number') {
			return info.height;
		}
		return 0;
	}

	function getSamples(info) {
		if (info.samples instanceof Array) {
			return info.samples.slice(0, 3);
		}
		return [];
	}
</script>

<script>
	import { getProvider } from '@iconify/search-core';
	import Height from './Height.svelte';

	/** @type {string} */
	// export let registry;
	/** @type {UITranslation} */
	export let phrases;
	/** @type {string} */
	export let provider;
	/** @type {string} */
	export let prefix;
	/** @type {CollectionInfo} */
	export let info;
	/** @type {function} */
	export let onClick;

	// Get link
	/** @type {string} */
	let link;
	$: {
		const providerData = getProvider(provider);
		if (providerData) {
			link = providerData.links.collection.replace('{prefix}', prefix);
			if (link === '') {
				link = '#';
			}
		} else {
			link = '#';
		}
	}

	// Get container class name
	/** @type {string} */
	let className;
	$: {
		className =
			baseClass +
			' ' +
			baseClass +
			'--prefix--' +
			prefix +
			(provider === ''
				? ''
				: ' ' + baseClass + '--provider--' + provider) +
			(collectionClickable ? ' ' + baseClass + '--clickable' : '') +
			(info.index
				? ' ' + baseClass + '--' + (info.index % maxIndex)
				: '');
	}

	// Samples
	const samples = getSamples(info);
	const samplesHeight = getSamplesHeight(info);

	// Height
	const height =
		'|' +
		(typeof info.height !== 'object'
			? info.height
			: info.height.join(', '));

	// Block was clicked
	function handleBlockClick(event) {
		if (collectionClickable) {
			event.preventDefault();
			onClick(prefix);
		}
	}
</script>

<li class={className} on:click={handleBlockClick}>
	<div class="iif-collection-text">
		<a href={link} on:click|preventDefault={() => onClick(prefix)}>
			{info.name}
		</a>
		{#if info.author}
			<small>
				{phrases.collection.by}
				{#if authorLink && info.author.url}
					<a
						href={info.author.url}
						target="_blank">{info.author.name}</a>
				{:else}{info.author.name}{/if}
			</small>
		{/if}
	</div>
	<div class="iif-collection-data">
		{#if samples.length > 0}
			<div
				class="iif-collection-samples{samplesHeight ? ' iif-collection-samples--' + samplesHeight : ''}">
				{#each samples as sample}
					<span
						class="iconify"
						data-icon={(provider === '' ? '' : '@' + provider + ':') + prefix + ':' + sample}
						data-inline="false" />
				{/each}
			</div>
		{/if}
		{#if info.height}
			<div class="iif-collection-height">
				<Height text={height} />
			</div>
		{/if}
		<div class="iif-collection-total">
			<Height text={info.total + ''} />
		</div>
	</div>
</li>
