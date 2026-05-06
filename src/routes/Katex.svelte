<script lang="ts">
	import type { KatexOptions } from 'katex';
	import katex from 'katex';

	let { math, displayMode = false }: { math: string; displayMode?: boolean } = $props();

	const options: KatexOptions = {
		throwOnError: false,
		output: 'mathml'
	};

	let katexString = $derived(katex.renderToString(math, { ...options, displayMode }));
</script>

{#if displayMode}
	<div class="m-1 block rounded bg-blue-100 p-1 dark:bg-blue-900">
		{@html katexString}
	</div>
{:else}
	<span class="m-1 inline-block rounded bg-blue-100 p-1 dark:bg-blue-900">
		{@html katexString}
	</span>
{/if}
