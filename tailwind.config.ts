import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))'
			}
		}
	},

	plugins: [
		typography,
		plugin(function ({ addBase }) {
			addBase({
				body: {
					'@apply text-foreground bg-background': ''
				}
			});
		})
	]
} satisfies Config;
