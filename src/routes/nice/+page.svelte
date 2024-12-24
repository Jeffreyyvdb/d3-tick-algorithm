<script lang="ts">
	import * as d3 from 'd3';
	import { tickIncrement } from 'd3-array';
	import { onMount } from 'svelte';

	let count = $state(10);
	let minDomain = $state(6.345);
	let maxDomain = $state(9.345);
	let domain = $derived([minDomain, maxDomain]);

	let height = $state(400);

	let yScale = $derived(d3.scaleLinear().domain(domain).range([height, 0]));

	let logs: { message: string; indent: number }[] = $state([]);

	function customLog(message: string, indent = 0) {
		logs = [...logs, { message, indent }];
	}

	const nice = function (count: number, domain: [number, number]) {
		if (count == null) count = 10;

		var d = domain;
		var i0 = 0;
		var i1 = d.length - 1;
		var start = d[i0];
		var stop = d[i1];
		var prestep;
		var step;
		var maxIter = 10;

		// Reset logs
		logs = [];

		customLog(`Initial Domain: [${d.join(', ')}]`);
		customLog(`Initial start: ${start}, stop: ${stop}`);

		if (stop < start) {
			customLog('Swapping start and stop as stop < start');
			[start, stop] = [stop, start];
			[i0, i1] = [i1, i0];
			customLog(`Swapped start: ${start}, stop: ${stop}`);
		}

		while (maxIter-- > 0) {
			step = tickIncrement(start, stop, count);
			customLog(`Iteration ${10 - maxIter}:`, 0);
			customLog(`Computed step: ${step}`, 1);

			if (step === prestep) {
				customLog('Converged. Updating domain...', 1);
				d[i0] = start;
				d[i1] = stop;
				customLog(`Final Domain: [${d.join(', ')}]`, 1);
				return;
			} else if (step > 0) {
				customLog('Adjusting for step > 0:', 1);
				customLog(`Before adjustment - start: ${start}, stop: ${stop}`, 2);
				start = Math.floor(start / step) * step;
				stop = Math.ceil(stop / step) * step;
				customLog(`After adjustment - start: ${start}, stop: ${stop}`, 2);
			} else if (step < 0) {
				customLog('Adjusting for step < 0:', 1);
				customLog(`Before adjustment - start: ${start}, stop: ${stop}`, 2);
				start = Math.ceil(start * step) / step;
				stop = Math.floor(stop * step) / step;
				customLog(`After adjustment - start: ${start}, stop: ${stop}`, 2);
			} else {
				customLog('Step is zero, breaking out of loop.', 1);
				break;
			}
			prestep = step;
			customLog(`Stored prestep: ${prestep}`, 1);
		}
		customLog('Exceeded max iterations or encountered step=0. Returning scale.');
	};

	onMount(() => {
		nice(count, [minDomain, maxDomain]);
	});
</script>

<div class="container mx-auto p-6">
	<article class="prose w-full dark:prose-invert">
		<h1>The <code>linear.nice(count)</code> function.</h1>
		<p>
			This <code>nice</code> function is a utility in D3 that adjusts the scale's domain to "nice" round
			numbers. It modifies the start and stop values of the domain to align them with the step size calculated
			for the given number of ticks. This ensures the ticks are well-spaced and easy to read.
		</p>

		<div class="prose mx-4 flex flex-col flex-wrap gap-4 dark:prose-invert">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Min domain</span>

				<input
					type="number"
					class="input"
					required
					bind:value={minDomain}
					oninput={() => {
						nice(count, [minDomain, maxDomain]);
					}}
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Max domain</span>
				<input
					type="number"
					class="input"
					required
					bind:value={maxDomain}
					oninput={() => {
						nice(count, [minDomain, maxDomain]);
					}}
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Count</span>
				<input
					type="number"
					class="input"
					required
					bind:value={count}
					oninput={() => {
						nice(count, [minDomain, maxDomain]);
					}}
				/>
			</label>
		</div>
		<div
			class="mt-6 rounded-lg bg-slate-100 p-4 font-mono text-sm text-slate-950 dark:bg-slate-900 dark:text-slate-50"
		>
			<div class="space-y-1">
				{#each logs as log}
					<div class="whitespace-pre-wrap" style="padding-left: {log.indent}rem">
						{log.message}
					</div>
				{/each}
			</div>
		</div>
	</article>
</div>
