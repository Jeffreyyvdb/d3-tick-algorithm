# d3-tick-algorithm

An interactive visualization of how D3's tick generation works:

- `d3.ticks(start, stop, count)` — the algorithm that picks "nice" round tick values (powers of 10 multiplied by 1, 2, or 5).
- `linear.nice(count)` — the iterative routine that snaps a scale's domain to those nice tick boundaries.

Each step (raw step size, magnitude, error, factor, increment, indices) is rendered alongside a live bar chart so you can see how the output changes as you tweak the inputs.

Live demo: https://jeffreyyvdb.github.io/d3-tick-algorithm/

## Stack

SvelteKit (Svelte 5 runes) + Tailwind + KaTeX + d3 (`d3-array`, `d3-axis`, `d3-scale`, `d3-selection`). Static-adapter build, deployed to GitHub Pages.

## Develop

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
bun run preview
```
