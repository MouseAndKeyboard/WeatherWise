/** @type {import('tailwindcss').Config} */

export const content = [
  "./components/**/*.{js,vue,ts}",
  "./layouts/**/*.vue",
  "./pages/**/*.vue",
  "./plugins/**/*.{js,ts}",
  "./nuxt.config.{js,ts}",
  "./app.vue",
];

export const theme = {
  extend: {
    colors: {
      primary: "#00B0FF",
      secondary: "#FFDE59",
      tertiary: "#FF6D00",
      quaternary: "#FF3D00",
    }
  },
};

export const plugins = [];
