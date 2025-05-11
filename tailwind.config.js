/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          teal: {
            50: '#e6f7f7',
            100: '#b3e7e7',
            200: '#80d7d7',
            300: '#4dc7c7',
            400: '#26bbbb',
            500: '#00aaaa',
            600: '#009999',
            700: '#008080',
            800: '#006666',
            900: '#004d4d',
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }