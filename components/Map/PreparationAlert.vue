<template>
    <button
      class="px-6 py-3 text-white bg-[#F27921] rounded-full text-[3vw] sm:text-sm md:text-base border-black border-2"
      :onclick="()=> {$event('focusSelf')}"
    >
      <b> There is a WATCH AND ACT fire alert in your area.</b>
    </button>
</template>


<script setup lang="ts">
const { $event } = useNuxtApp()

import { useMapStore } from '@/stores/mapStore';

const mapStore = useMapStore();
</script>