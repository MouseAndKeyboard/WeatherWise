<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl, { LngLat } from "mapbox-gl";
import { onMounted } from "vue";

const accessToken =
  "pk.eyJ1IjoiY2puYmVubmV0dCIsImEiOiJjbGhsaTRxc2EwOWw3M3FwOTQ0N3luaW5qIn0.8XbLwV61cr2oFs7ue0wCCw";
const westernAustralia: [number, number] = [121.8997, -25.5528];
const bounds: [number, number, number, number] = [
  104.9211, -42.1406, 136.0019, -6.6683,
];

mapboxgl.accessToken = accessToken;

onMounted(() => {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/satellite-v9",
    center: westernAustralia,
    maxBounds: bounds,
    minZoom: 0,
  });


  map.on("load", () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const el = document.createElement("div");
        el.className = "marker w-4 h-4 bg-blue-500 rounded-full border-2 border-white";
        new mapboxgl.Marker(el)
          .setLngLat(
            new LngLat(position.coords.longitude, position.coords.latitude)
          )
          .addTo(map);
      },
      (error) => {
        console.log(error.message);
      }
    );
  });
});
</script>
