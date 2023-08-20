import { defineNuxtConfig } from "nuxt/config";
import dotenv from 'dotenv';
dotenv.config();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }
      ]
    }
  },
  modules: ["@pinia/nuxt"],
  devtools: { enabled: true },
  ssr: false,
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    // The private keys which are only available within server-side
    
    // Keys within public, will be also exposed to the client-side
    public: {
      mb_key: process.env.mb_key ?? "",
      oai_key: process.env.oai_key ?? "",
    }
  }
});
