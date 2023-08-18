/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00B0FF",
        secondary: "#FFDE59",
        tertiary: "#FF6D00",
        quaternary: "#FF3D00",
      }
    },
  },

  plugins: [
    require('daisyui'),
  ],
};
