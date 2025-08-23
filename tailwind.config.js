/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./app/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: "var(--color-primary)",
				"primary-hover": "var(--color-primary-hover)",
			},
			transitionDuration: {
				DEFAULT: "300ms",
			},
		},
	},
	plugins: [],
};
