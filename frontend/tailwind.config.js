/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables dark mode toggles via class
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7fe',
          100: '#e8eefd',
          200: '#ccd9fb',
          300: '#a1bbf7',
          400: '#7093f1',
          500: '#4a6be9',
          600: '#334cdb',
          700: '#283ac6',
          800: '#2531a1',
          900: '#222d80',
          950: '#151a4e',
        },
        slate: {
          850: '#141e33',
          900: '#0b1329',
          950: '#060a17'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
