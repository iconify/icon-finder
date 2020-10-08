<script>
	import { stringToIcon } from '@iconify/search-core';
	import { capitalize } from '../../../misc/capitalize';
	import { getIconCode } from '../../../misc/code-samples';
	import SampleInput from '../../forms/Sample.svelte';
	import Icon from '../../misc/Icon.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let iconName;
	/** @type {IconCustomisations} */
	export let iconCustomisations;
	/** @type {ProviderCodeData} */
	export let providerConfig;
	/** @type {AvailableLanguages} */
	export let mode;
	/** @type {string} */
	// export let title;

	/** @type {UITranslation.code} */
	const phrases = registry.phrases.code;
	/** @type {Record<string, string | Record<string, string>>} */
	const text = phrases.text;

	/** @type {Icon} */
	const icon = stringToIcon(iconName);

	// Get mode specific data
	/** @type {CodeOutput | null} */
	let output;

	/** @type {string} */
	let docsText;
	$: {
		output = getIconCode(
			mode,
			iconName,
			iconCustomisations,
			providerConfig
		);

		// Get title for docs
		if (output.docs) {
			docsText =
				phrases.docs && phrases.docs[output.docs.type]
					? phrases.docs[output.docs.type]
					: phrases.docsDefault.replace(
							'{title}',
							capitalize(output.docs.type)
					  );
		} else {
			docsText = '';
		}
	}
</script>

{#if output}
	{#if text.intro && text.intro[mode]}
		<p>{text.intro[mode]}</p>
	{/if}

	{#if output.iconify}
		<p>{text.iconify.intro1.replace('{name}', icon.name)}</p>
		<SampleInput {registry} content={output.iconify.html} />
		<p>{text.iconify.intro2}</p>
		<p>{text.iconify.head}</p>
		<SampleInput {registry} content={output.iconify.head} />
	{/if}

	{#if output.raw}
		{#each output.raw as code}
			<SampleInput {registry} content={code} />
		{/each}
	{/if}

	{#if output.component}
		{#each ['install', 'install1', 'import', 'import1', 'vue', 'use'] as key}
			{#if typeof output.component[key] === 'string'}
				<p>{text.component[key]}</p>
				<SampleInput {registry} content={output.component[key]} />
			{/if}
		{/each}
	{/if}

	{#if output.docs}
		<p class="iif-code-docs">
			<Icon icon="docs" />
			<a href={output.docs.href} target="_blank">
				{docsText}
				<Icon icon="link" />
			</a>
		</p>
	{/if}
{/if}
