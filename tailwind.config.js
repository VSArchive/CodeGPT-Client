/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
	theme: {
		extend: {
			typography: () => ({
				DEFAULT: {
					css: [
						{
							'ul > li.task-list-item::before': {
								content: 'none',
							},
						},
					],
				},
			}),
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
