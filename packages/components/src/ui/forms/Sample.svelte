<script context="module">
	const baseClassName = 'iif-input-sample';
</script>

<script>
	import Icon from '../misc/Icon.svelte';

	/** @type {Registry} */
	export let registry;
	/** @type {string} */
	export let content;

	const text = registry.phrases.code;

	/** @type {string} */
	let className = baseClassName;

	/** @type {number} */
	let notice = 0;

	$: {
		className =
			baseClassName +
			(notice > 0 ? ' ' + baseClassName + '--with-notice' : '');
	}

	/**
	 * Copy to clipboard
	 */
	function copy() {
		const node = document.body;
		const textarea = document.createElement('textarea');
		textarea.value = content;
		textarea.style.height = 0;
		node.appendChild(textarea);

		textarea.focus();
		textarea.select();

		let copied = false;
		try {
			// Modern way
			if (!document.execCommand || !document.execCommand('copy')) {
				// Ancient way
				if (window.clipboardData) {
					window.clipboardData.setData('Text', rawCode);
					copied = true;
				}
			} else {
				copied = true;
			}
		} catch (err) {}

		// Remove textarea on next tick
		setTimeout(() => {
			node.removeChild(textarea);
		});

		if (copied) {
			// Show notice
			notice++;

			// Remove notice after 2 seconds
			setTimeout(() => {
				if (notice) {
					notice--;
				}
			}, 2000);
		}
	}
</script>

<div class={className}>
	<div class={baseClassName + '-content'}>{content}</div>
	<a title={text.copy} href="# " on:click|preventDefault={copy}><Icon
			icon="clipboard" /></a>
	{#if notice > 0}
		<div class={baseClassName + '-notice'}>
			<Icon icon="confirm" />
			{text.copied}
		</div>
	{/if}
</div>
