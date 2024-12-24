<script lang="ts">
	import * as d3 from 'd3';
	import Katex from './Katex.svelte';

	let svgElement: SVGSVGElement;
	let containerDiv: HTMLDivElement;
	let width = $state(600);
	let height = $state(400);
	const marginTop = $state(60);
	const marginRight = $state(60);
	const marginBottom = $state(60);
	const marginLeft = $state(60);

	let data = $state([
		{
			x: 'A',
			y: 4
		},
		{
			x: 'B',
			y: 8
		},
		{
			x: 'C',
			y: 15
		},
		{
			x: 'D',
			y: 16
		},
		{
			x: 'E',
			y: 23
		},
		{
			x: 'F',
			y: 45
		},
		{
			x: 'G',
			y: 2
		}
	]);

	let domain = $state(d3.extent(data, (d) => d.y) as [number, number]);

	let nice = $state(true);

	// For the tick steps explanation
	let start = $derived(domain[0]);
	let stop = $derived(domain[1]);
	let count = $state(10);
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
		d3
			.scaleBand()
			.domain(data.map((d) => d.x))
			.range([marginLeft, width - marginRight])
			.padding(0.1)
	);

	let yScale = $derived.by(() => {
		let yScale = d3
			.scaleLinear()
			.domain(domain)
			.range([height - marginBottom, marginTop]);

		return nice ? yScale.nice(count) : yScale;
	});

	$effect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width: w, height: h } = entry.contentRect;

				requestAnimationFrame(() => {
					width = w;
					height = 600;
				});
			}
		});

		resizeObserver.observe(containerDiv);

		svgElement.innerHTML = '';

		// Create the SVG container.
		const svg = d3.select(svgElement).attr('width', width).attr('height', height);

		// Add the x-axis.
		svg
			.append('g')
			.attr('transform', `translate(0,${height - marginBottom})`)
			.call(d3.axisBottom(xScale));

		// Add the y-axis.
		const axisGenerator = d3.axisLeft(yScale);
		axisGenerator.ticks(count);
		svg.append('g').attr('transform', `translate(${marginLeft},0)`).call(axisGenerator);

		// Add the bars.
		svg
			.append('g')
			.selectAll('rect')
			.data(data)
			.join('rect')
			.attr('x', (d) => xScale(d.x)!)
			.attr('y', (d) => yScale(d.y))
			.attr('height', (d) => {
				let height = yScale(yScale.domain()[0]) - yScale(d.y);
				console.log({ height, d, range: yScale.range(), domain: yScale.domain() });
				return height < 0 ? 0 : height;
			})
			.attr('width', xScale.bandwidth())
			.attr('class', 'fill-green-500');

		return () => {
			resizeObserver.disconnect();
		};
	});
</script>

<div class="container mx-auto grid space-y-6 p-6 lg:grid-cols-2 lg:gap-6">
	<!-- Sticky Chart Container -->
	<div
		bind:this={containerDiv}
		class="top-6 w-full rounded-lg border border-gray-200 bg-white p-4 pb-8 shadow-sm lg:sticky lg:h-[calc(100vh-3rem)]"
	>
		<div class="mx-4 flex flex-wrap gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-gray-700">Min domain</span>
				<input
					type="number"
					bind:value={domain[0]}
					class="focus:ring-black-500 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-gray-700">Max domain</span>
				<input
					type="number"
					bind:value={domain[1]}
					class="focus:ring-black-500 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-gray-700">Count</span>
				<input
					type="number"
					bind:value={count}
					class="focus:ring-black-500 w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium text-gray-700">Nice?</span>
				<input type="checkbox" bind:checked={nice} />
			</label>
		</div>
		<svg bind:this={svgElement} class="h-full w-full"></svg>
	</div>

	<div class="space-y-6">
		<article class="prose w-full">
			<h1>Default D3 Chart</h1>
			<p>
				By default, <code>d3.ScaleLinear</code> tries to create 10 ticks using the
				<code>d3.ticks(start, stop, count)</code>
				function.
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
						displayMode={false}
					/>
				</li>

				<Katex
					math={`\\text{${step}} = \\frac{\\text{${stop}} - \\text{${start}}}{\\max(0, \\text{${count}})}`}
				/>

				<li>
					Find the magnitude of the step size by taking the base-10 logarithm of the step and
					flooring it :
					<Katex
						math={'\\text{magnitude} =  \\lfloor\\log_{10}\\left(\\text{step}\\right)\\rfloor'}
					/>

					<div class="border-l-4 bg-gray-100 text-sm">
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
					<div class="border-l-4 bg-gray-100 text-sm">
						<code>i1</code> and <code>i2</code> are the indices that represent the first (<code
							>i1</code
						>) and the last (<code>i2</code>) tick values in the range between <code>start</code>
						and <code>stop</code>.
					</div>
				</li>
				<li>
					Resulting ticks = {d3.ticks(start, stop, count)}
				</li>
				<p class="border-l-4 bg-gray-100 text-sm">
					The full code also handles the cases where start is greater then stop. And when power is
					negative. See: <a href="https://github.com/d3/d3-array/blob/main/src/ticks.js"
						>github.com/d3/d3-array/blob/src/ticks.js</a
					>
				</p>
			</ol>
		</article>
	</div>
</div>
