<template>
  <main>
    <TopBar />
    <div
      class="absolute z-10 -translate-x-1/2 top-[calc(56px+20px)] w-max left-1/2"
    >
      <!-- <PreparationAlert /> -->
    </div>
    <AppMap class="w-full h-[calc(100svh-64px-56px)]" />
    <!-- <NavBar /> -->
  </main>
</template>

<script setup lang="ts">
import { useMapStore, MapStatus } from "@/stores/mapStore";
import { LngLat } from "mapbox-gl";
const { $event } = useNuxtApp();
const mapStore = useMapStore();

navigator.geolocation.getCurrentPosition((position) => {
  let currentPos = new LngLat(115.8588576, -31.9560394);
  mapStore.setStart(currentPos);
});
</script>
