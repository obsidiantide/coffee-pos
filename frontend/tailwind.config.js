/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6B4F4F',
        },
        accent: '#D4A373',
      },
    },
  },
  plugins: [],
}
