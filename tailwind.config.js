/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{html,ts}"],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Outfit',
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Oxygen',
					'Ubuntu',
					'Cantarell',
					'sans-serif',
				],
				outfit: [
					'Outfit',
					'sans-serif',
				],
				mono: [
					'JetBrains Mono',
					'Fira Code',
					'Monaco',
					'Consolas',
					'monospace',
				],
			},
			fontSize: {
				// Override Tailwind's default base font size
				base: '16px', // Updated to 16px for better readability
			},
			colors: {
				// Custom color extensions can be added here if needed
				// The design system primarily uses Tailwind's default slate and blue scales
			},
			spacing: {
				// Ensure 4px base unit spacing
				// Tailwind defaults already follow this (0.25rem = 4px)
			},
		},
	},
	plugins: [require("tailwind-scrollbar")],
};
