<script lang="ts">
	import { tickIncrement } from 'd3-array';

	let count = $state(10);
	let minDomain = $state(6.345);
	let maxDomain = $state(9.345);

	type LogEntry = { message: string; indent: number };

	function runNice(c: number, domainInput: [number, number]): LogEntry[] {
		const out: LogEntry[] = [];
		const log = (message: string, indent = 0) => out.push({ message, indent });

		if (c == null) c = 10;

		const d = [...domainInput];
		let i0 = 0;
		let i1 = d.length - 1;
		let start = d[i0];
		let stop = d[i1];
		let prestep: number | undefined;
		let step: number;
		let maxIter = 10;

		log(`Initial Domain: [${d.join(', ')}]`);
		log(`Initial start: ${start}, stop: ${stop}`);

		if (stop < start) {
			log('Swapping start and stop as stop < start');
			[start, stop] = [stop, start];
			[i0, i1] = [i1, i0];
			log(`Swapped start: ${start}, stop: ${stop}`);
		}

		while (maxIter-- > 0) {
			step = tickIncrement(start, stop, c);
			log(`Iteration ${10 - maxIter}:`, 0);
			log(`Computed step: ${step}`, 1);

			if (step === prestep) {
				log('Converged. Updating domain...', 1);
				d[i0] = start;
				d[i1] = stop;
				log(`Final Domain: [${d.join(', ')}]`, 1);
				return out;
			} else if (step > 0) {
				log('Adjusting for step > 0:', 1);
				log(`Before adjustment - start: ${start}, stop: ${stop}`, 2);
				start = Math.floor(start / step) * step;
				stop = Math.ceil(stop / step) * step;
				log(`After adjustment - start: ${start}, stop: ${stop}`, 2);
			} else if (step < 0) {
				log('Adjusting for step < 0:', 1);
				log(`Before adjustment - start: ${start}, stop: ${stop}`, 2);
				start = Math.ceil(start * step) / step;
				stop = Math.floor(stop * step) / step;
				log(`After adjustment - start: ${start}, stop: ${stop}`, 2);
			} else {
				log('Step is zero, breaking out of loop.', 1);
				break;
			}
			prestep = step;
			log(`Stored prestep: ${prestep}`, 1);
		}
		log('Exceeded max iterations or encountered step=0. Returning scale.');
		return out;
	}

	let logs = $derived(runNice(count, [minDomain, maxDomain]));
</script>

<div class="container mx-auto p-6">
	<article class="prose w-full dark:prose-invert">
		<h1>The <code>linear.nice(count)</code> function.</h1>
		<p>
			This <code>nice</code> function is a utility in D3 that adjusts the scale's domain to "nice"
			round numbers. It modifies the start and stop values of the domain to align them with the step
			size calculated for the given number of ticks. This ensures the ticks are well-spaced and easy
			to read.
		</p>

		<div class="prose mx-4 flex flex-col flex-wrap gap-4 dark:prose-invert">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Min domain</span>
				<input type="number" class="input" required bind:value={minDomain} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Max domain</span>
				<input type="number" class="input" required bind:value={maxDomain} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Count</span>
				<input type="number" class="input" required bind:value={count} />
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
