<template>
  <button
    class="px-6 py-3 text-white bg-[#F27921] rounded-full text-[3vw] sm:text-sm md:text-base border-black border-2"
    v-if="mapStore.getStatus==MapStatus.INITIAL" 
    :onclick="
      () => {
        $event('focusSelf');
      }
    "
  >
    <b> There is a WATCH AND ACT fire alert in your area.</b>
  </button>

  <a href="https://goo.gl/maps/26bPPnAT92zaAgMEA" v-if="mapStore.getStatus==MapStatus.GENERATE_ROUTE" >
    <button
      class="px-6 py-3 text-white bg-[#F27921] rounded-full text-[3vw] sm:text-sm md:text-base border-black border-2"
    >
      <b>Open Route in Google Maps</b>
    </button>
  </a>
</template>

<script setup lang="ts">
const { $event } = useNuxtApp();

import { MapStatus, useMapStore } from "@/stores/mapStore";

const mapStore = useMapStore();
</script>
