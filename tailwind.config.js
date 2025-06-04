/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-merriweather)', 'serif'], // Make Merriweather the default
        mono: ['var(--font-geist-mono)', 'monospace'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
    },
  },
  plugins: [],
};