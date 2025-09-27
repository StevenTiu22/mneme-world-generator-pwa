/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Map your CSS variables to Tailwind's color names
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", // Uses your --color-background
        foreground: "hsl(var(--foreground))", // Uses your --color-text
        primary: {
          DEFAULT: "hsl(var(--primary))", // Uses your --color-primary
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Uses your --color-secondary
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        // Map your fonts
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-ibmplexmono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}