<template>
  <main>
    <TopBar />
    <div
      class="absolute z-10 -translate-x-1/2 top-[calc(56px+20px)] w-max left-1/2"
    >
      <PreparationAlert v-if="mapStore.status == MapStatus.INITIAL" />
    </div>
    <AppMap class="w-full h-[calc(100vh-64px-56px)]" />
    <NavBar />
  </main>
</template>

<script setup lang="ts">
import { useMapStore, MapStatus } from "@/stores/mapStore";
import { LngLat } from "mapbox-gl";
const mapStore = useMapStore();

navigator.geolocation.getCurrentPosition(
      (position) => {
        let currentPos = new LngLat(position.coords.longitude, position.coords.latitude)

      mapStore.setStart(currentPos);
      },)

</script>
