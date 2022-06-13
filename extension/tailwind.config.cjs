/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/popup/index.html",
    "./src/pages/options/index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require('@tailwindcss/typography')],
}
