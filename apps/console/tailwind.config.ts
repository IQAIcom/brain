import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";
import type { PluginUtils } from "tailwindcss/types/config";

export default {
	darkMode: ["class"],
	content: ["src/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
	theme: {
		extend: {
			typography: ({ theme }: PluginUtils) => ({
				DEFAULT: {
					css: {
						"--tw-prose-body": theme("colors.foreground"),
						"--tw-prose-headings": theme("colors.foreground"),
						"--tw-prose-lead": theme("colors.foreground"),
						"--tw-prose-links": theme("colors.primary.DEFAULT"),
						"--tw-prose-bold": theme("colors.foreground"),
						"--tw-prose-counters": theme("colors.foreground"),
						"--tw-prose-bullets": theme("colors.foreground"),
						"--tw-prose-hr": theme("colors.border"),
						"--tw-prose-quotes": theme("colors.secondary.foreground"),
						"--tw-prose-quote-borders": theme("colors.border"),
						"--tw-prose-captions": theme("colors.muted.foreground"),
						"--tw-prose-code": theme("colors.secondary.foreground"),
						"--tw-prose-pre-code": theme("colors.secondary.foreground"),
						"--tw-prose-pre-bg": theme("colors.secondary.DEFAULT"),
						"--tw-prose-th-borders": theme("colors.border"),
						"--tw-prose-td-borders": theme("colors.border"),
						"--tw-prose-invert-body": theme("colors.background"),
						"--tw-prose-invert-headings": theme("colors.background"),
						"--tw-prose-invert-lead": theme("colors.background"),
						"--tw-prose-invert-links": theme("colors.background"),
						"--tw-prose-invert-bold": theme("colors.background"),
						"--tw-prose-invert-counters": theme("colors.background"),
						"--tw-prose-invert-bullets": theme("colors.background"),
						"--tw-prose-invert-hr": theme("colors.background"),
						"--tw-prose-invert-quotes": theme("colors.background"),
						"--tw-prose-invert-quote-borders": theme("colors.background"),
						"--tw-prose-invert-captions": theme("colors.background"),
						"--tw-prose-invert-code": theme("colors.background"),
						"--tw-prose-invert-pre-code": theme("colors.background"),
						"--tw-prose-invert-pre-bg": theme("colors.background"),
						"--tw-prose-invert-th-borders": theme("colors.background"),
						"--tw-prose-invert-td-borders": theme("colors.background"),
					},
				},
			}),
			fontFamily: {
				sans: [
					"Inter",
					"ui-sans-serif",
					"system-ui",
					"sans-serif",
					"Apple Color Emoji",
					"Segoe UI Emoji",
					"Segoe UI Symbol",
					"Noto Color Emoji",
				],
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			container: {
				center: true,
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
		},
	},
	plugins: [tailwindAnimate],
} satisfies Config;
