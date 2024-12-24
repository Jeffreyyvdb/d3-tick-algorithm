<script lang="ts">
	import type { KatexOptions } from 'katex';
	import katex from 'katex';
	export let math;
	export let displayMode = false;

	const options: KatexOptions = {
		displayMode: displayMode,
		throwOnError: false,
		output: 'mathml'
	};

	$: katexString = katex.renderToString(math, options);
</script>

<div class=" m-1 inline-block rounded bg-blue-100 p-1">
	{@html katexString}
</div>
