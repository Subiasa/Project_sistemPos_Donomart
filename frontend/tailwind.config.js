/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          50: '#eef4ff',
          100: '#e0ecff',
          200: '#c6daff',
          300: '#a3bfff',
          400: '#7898ff',
          500: '#4f68ff',
          600: '#0346C8',
          700: '#263ebf',
          800: '#24339b',
          900: '#222f7b',
          950: '#161d4a',
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
}
