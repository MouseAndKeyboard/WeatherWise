<template>
  <nav class="h-[64px] flex flex-row bg-gray-100 shadow-lg p-2 rounded-md">
    <NuxtLink class="flex items-center justify-center w-1/2 transition-transform transform hover:scale-105 rounded-md" to="/">
        <div class="flex flex-col items-center">
            <span class="material-icons text-primary mb-1">map</span>
            <div class="text-sm text-primary">Map</div>
        </div>
    </NuxtLink>
    <NuxtLink class="flex items-center justify-center w-1/2 transition-transform transform hover:scale-105 rounded-md" to="/chat">
        <div class="flex flex-col items-center">
            <span class="material-icons text-[#F27921] mb-1">chat_bubble</span>
            <div class="text-sm text-[#F27921]">Preparation Plan</div>
        </div>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts"></script>

<style scoped>
.material-icons {
  font-size: 24px;
}
</style>
