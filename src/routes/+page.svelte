<script lang="ts">
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { axisBottom, axisLeft } from 'd3-axis';
	import { extent, ticks } from 'd3-array';
	import { select } from 'd3-selection';
	import Katex from './Katex.svelte';
	import { base } from '$app/paths';

	let svgElement: SVGSVGElement;
	let chartFrame: HTMLDivElement;
	let width = $state(600);
	let height = $state(400);
	const marginTop = 60;
	const marginRight = 60;
	const marginBottom = 60;
	const marginLeft = 60;

	let data = $state([
		{ x: 'A', y: 4 },
		{ x: 'B', y: 8 },
		{ x: 'C', y: 15 },
		{ x: 'D', y: 16 },
		{ x: 'E', y: 23 },
		{ x: 'F', y: 45 },
		{ x: 'G', y: 2 }
	]);

	let domain = $state(extent(data, (d) => d.y) as [number, number]);
	let nice = $state(true);
	let count = $state(10);

	// Tick algorithm explanation
	let start = $derived(domain[0]);
	let stop = $derived(domain[1]);
	let step = $derived((stop - start) / count);
	let power = $derived(Math.floor(Math.log10(step)));
	let error = $derived(step / Math.pow(10, power));
	let factor = $derived(
		error >= Math.sqrt(50) ? 10 : error >= Math.sqrt(10) ? 5 : error >= Math.sqrt(2) ? 2 : 1
	);
	let inc = $derived(Math.pow(10, power) * factor);
	let i1 = $derived(Math.round(start / inc));
	let i2 = $derived(Math.round(stop / inc));

	let xScale = $derived(
		scaleBand()
			.domain(data.map((d) => d.x))
			.range([marginLeft, width - marginRight])
			.padding(0.1)
	);

	let yScale = $derived.by(() => {
		const s = scaleLinear()
			.domain(domain)
			.range([height - marginBottom, marginTop]);
		return nice ? s.nice(count) : s;
	});

	// Bar baseline must clamp to the visible range so bars sit on the x-axis
	// even when nice() expands the domain past zero or to negatives.
	let baselineY = $derived(yScale(Math.max(0, yScale.domain()[0])));

	$effect(() => {
		if (!chartFrame) return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width: w, height: h } = entry.contentRect;
				width = w;
				height = h;
			}
		});
		observer.observe(chartFrame);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!svgElement) return;
		const svg = select(svgElement).attr('width', width).attr('height', height);
		svg.selectAll('*').remove();

		svg.append('g').attr('transform', `translate(0,${baselineY})`).call(axisBottom(xScale));

		svg
			.append('g')
			.attr('transform', `translate(${marginLeft},0)`)
			.call(axisLeft(yScale).ticks(count));

		svg
			.append('g')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', (d) => xScale(d.x) ?? 0)
			.attr('y', (d) => Math.min(yScale(d.y), baselineY))
			.attr('height', (d) => Math.max(0, Math.abs(baselineY - yScale(d.y))))
			.attr('width', xScale.bandwidth());
	});
</script>

<div class="container mx-auto grid space-y-6 p-6 lg:grid-cols-2 lg:gap-6">
	<div
		class="top-6 flex w-full flex-col rounded-lg border border-gray-200 p-4 pb-8 shadow-sm lg:sticky lg:h-[calc(100vh-3rem)] dark:border-gray-800"
	>
		<div class="prose mx-4 flex shrink-0 flex-col flex-wrap gap-4 dark:prose-invert">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Min domain</span>
				<input type="number" class="input" required bind:value={domain[0]} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Max domain</span>
				<input type="number" class="input" required bind:value={domain[1]} />
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Count</span>
				<input type="number" class="input" required bind:value={count} />
			</label>
			<label class="flex cursor-pointer flex-row items-center">
				<input
					type="checkbox"
					bind:checked={nice}
					aria-label="Apply nice function"
					class="peer sr-only"
				/>
				<div
					class="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
				></div>
				<span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Nice function</span>
			</label>
		</div>
		<div bind:this={chartFrame} class="min-h-80 min-w-0 flex-1 overflow-hidden lg:min-h-0">
			<svg
				bind:this={svgElement}
				class="block h-full w-full fill-red-500 text-[hsl(224_71.4%_4.1%)] dark:text-[hsl(210_20%_98%)]"
			></svg>
		</div>
	</div>

	<div class="space-y-6">
		<article class="prose w-full dark:prose-invert">
			<h1>Default D3 Chart</h1>
			<p>
				By default, <code>d3.ScaleLinear</code> tries to create 10 ticks using the
				<code>d3.ticks(start, stop, count)</code>
				function.
			</p>
			<p class="border-l-2 bg-gray-100 pl-1 text-sm dark:bg-gray-900">
				Want to know how the nice function works? See: <a href="{base}/nice">Nice function demo</a>
			</p>

			<h2>
				The <code>d3.ticks(start, stop, count)</code> function.
			</h2>
			<p>
				Returns an array of approximately count + 1 uniformly-spaced, nicely-rounded values between
				start and stop (inclusive). Each value is a power of ten multiplied by 1, 2 or 5.
				<br />
				<br />
				The ticks are generated using the following algorithm:
			</p>
			<ol>
				<li>
					The raw step size is calculated like:
					<Katex
						math={`\\text{step} = \\frac{\\text{stop} - \\text{start}}{\\max(0, \\text{count})}`}
					/>
				</li>

				<Katex
					math={`\\text{${step}} = \\frac{\\text{${stop}} - \\text{${start}}}{\\max(0, \\text{${count}})}`}
				/>

				<li>
					Find the magnitude of the step size by taking the base-10 logarithm of the step and
					flooring it:
					<Katex
						math={'\\text{magnitude} =  \\lfloor\\log_{10}\\left(\\text{step}\\right)\\rfloor'}
					/>

					<div class="border-l-2 bg-gray-100 pl-1 text-sm dark:bg-gray-900">
						The parentheses around log10(step) mean a floor function
					</div>
					<Katex math={`\\text{Step 1: }  = \\log_{10}(\\text{step}) = ${Math.log10(step)}`} />
					<br />
					<Katex
						math={`\\text{Step 2: } \\left\\lfloor \\log_{10}(\\text{step}) \\right\\rfloor = ${Math.floor(Math.log10(step))}`}
					/>
				</li>

				<li>
					Adjust the step size to be a multiple of 1, 2, or 5 of the order of magnitude:
					<Katex math={'\\text{error} = \\frac{\\text{step}}{10^\\text{magnitude}}'} />
					<Katex math={` = \\frac{\\text{${step}}}{10^\\text{${power}}} = ${error}`} />
					<br />
					<br />
					Determine the factor<br />
					<Katex math={`\\text{if } (\\text{error} \\geq \\sqrt{50}) factor = 10 `} /><Katex
						math={`\\sqrt{50}) = ${Math.sqrt(50)} `}
					/><br />
					<Katex math={`\\text{if } (\\text{error} \\geq \\sqrt{10}) factor = 5 `} /><Katex
						math={`\\sqrt{10}) = ${Math.sqrt(10)} `}
					/><br />
					<Katex math={`\\text{if } (\\text{error} \\geq \\sqrt{2}) factor = 2 `} /><Katex
						math={`\\sqrt{2}) = ${Math.sqrt(2)} `}
					/><br />
					<Katex math={`\\text{else } factor = 1 `} /><br />

					<span>Error = {error} -> factor = {factor}</span>
				</li>

				<li>
					<Katex math={'\\text{inc} = 10^{\\text{power}} \\times \\text{factor}'} /> = <Katex
						math={`10^{\\text{${power}}} \\times \\text{${factor}} = ${inc}`}
					/> <br />
					<Katex math={'i_1 = \\text{round}\\left( \\frac{\\text{start}}{\\text{inc}} \\right)'} /> =
					<Katex math={`\\text{round}\\left( \\frac{\\text{${start}}}{\\text{${inc}}} \\right)`} /> =
					{i1}
					<br />
					<br />
					<Katex math={'i_2 = \\text{round}\\left( \\frac{\\text{stop}}{\\text{inc}} \\right)'} /> =
					<Katex math={`\\text{round}\\left( \\frac{\\text{${stop}}}{\\text{${inc}}} \\right)`} /> =
					{i2}
					<br />
					<div class="border-l-2 bg-gray-100 pl-1 text-sm dark:bg-gray-900">
						<code>i1</code> and <code>i2</code> are the indices that represent the first (<code
							>i1</code
						>) and the last (<code>i2</code>) tick values in the range between <code>start</code>
						and <code>stop</code>.
					</div>
				</li>
				<li>
					Resulting ticks = {ticks(start, stop, count)}
				</li>
				<p class="border-l-2 bg-gray-100 pl-1 text-sm dark:bg-gray-900">
					The full code also handles the cases where start is greater then stop, and when power is
					negative. See:
					<a href="https://github.com/d3/d3-array/blob/main/src/ticks.js">
						github.com/d3/d3-array/blob/src/ticks.js
					</a>
				</p>
			</ol>
		</article>
	</div>
</div>
