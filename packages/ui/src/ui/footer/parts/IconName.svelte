<script>
	import Icon from '../../misc/Icon.svelte';

	export let registry; /** @type {Registry} */
	export let loaded; /** @type {boolean} */
	export let iconName; /** @type {string} */

	const phrases = registry.phrases.footer;
</script>

{#if loaded}
	<div class="iif-footer-icon-name iif-footer-icon-name--simple">
		<dl>
			<dt>{phrases.iconName}</dt>
			<dd>
				<Icon icon={iconName} />
				<div class="iif-footer-icon-name-input">
					<span>{iconName}</span>
				</div>
			</dd>
		</dl>
	</div>
{/if}
