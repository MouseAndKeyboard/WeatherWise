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
        primary: "#5CC89B",
        secondary: "#57CD5F",
        tertiary: "#70ABE8",
        quaternary: "#FF3D00",
      }
    },
  },

  plugins: [
    require('daisyui'),
  ],
};
