/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class", // 'class' mode allows toggling with a class
	content: [
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./app/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				// Light/Dark theme variables
				primary: "var(--color-primary)",
				"primary-hover": "var(--color-primary-hover)",
				secondary: "var(--color-secondary)",
				"secondary-hover": "var(--color-secondary-hover)",
				accent: "var(--color-accent)",
				"bg-light": "var(--color-bg-light)",
				"bg-dark": "var(--color-bg-dark)",
				"text-light": "var(--color-text-light)",
				"text-dark": "var(--color-text-dark)",
			},
			transitionDuration: {
				DEFAULT: "300ms",
			},
		},
	},
	plugins: [],
};
