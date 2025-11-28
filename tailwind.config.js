/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf9f3',
          100: '#faf2e7',
          200: '#f5e5d0',
          300: '#efd2b5',
          400: '#e6b800',
          500: '#d4a400',
          600: '#c29000',
          700: '#9d7200',
          800: '#7a5900',
          900: '#5a4233',
        },
        accent: {
          50: '#fffbf0',
          100: '#fef7e0',
          200: '#fdefc0',
          300: '#fce7a0',
          400: '#fbdd7c',
          500: '#f5c942',
          600: '#e6b800',
          700: '#d4a400',
          800: '#b8900c',
          900: '#9d7c0a',
        },
      },
    },
  },
  plugins: [],
}


