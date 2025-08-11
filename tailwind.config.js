/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "blueColor": "#3B9DD2",
        "greenColor": "#58C958",
        "greyColor": "#D9D9D9",

      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
         
      }
    },
  },
  plugins: [],
}

