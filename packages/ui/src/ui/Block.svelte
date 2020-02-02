<script context="module">
	const baseClass = 'iif-block';
</script>

<script>
	export let type = '';
	export let name = '';
	export let extra = '';

	let className;
	$: {
		className = baseClass;
		if (type !== '') {
			let typeBase = ' ' + baseClass + '--' + type;
			className += typeBase;
			if (name !== '') {
				className += typeBase + '--' + name;
			}
		}
		if (extra !== '') {
			className += ' ' + baseClass + '--' + extra;
		}
		console.log(`Rendering Block at ${Date.now()}: ${className}`);
	}
</script>

<div class={className}>
	<slot />
</div>
