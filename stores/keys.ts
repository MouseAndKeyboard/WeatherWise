import { defineStore } from "pinia";
import dotenv from 'dotenv';
dotenv.config();

export const useKeysStore = defineStore("keys", {
    state: () => ({
        mapboxToken: process.env.mb_key,
        openaiToken: process.env.oi_key,
    }),
    getters: {
        getMapboxToken: (state) => state.mapboxToken,
        getOpenaiToken: (state) => state.openaiToken,
    },
});
        