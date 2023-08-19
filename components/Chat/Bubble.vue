<template>
  <div class="chat" :class="role=='user' ? 'chat-end' : 'chat-start'">
    <div class="chat-bubble chat-bubble-primary overflow-hidden bg-white text-black">
        <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  role: String,
})
</script>
