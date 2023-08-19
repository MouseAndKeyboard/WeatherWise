<template>
  <div class="chat" :class="role=='user' ? 'chat-end' : 'chat-start'">
    <div class="chat-bubble">
        <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  role: String,
})
</script>

<style scoped>
/* General styling */
.chat {
  display: flex;
  padding: 10px;
}

.chat-bubble {
  max-width: 70%;
  padding: 15px;
  border-radius: 18px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  font-family: 'Arial', sans-serif;
  position: relative;
}

/* Styling for the "user" role */
.chat-end .chat-bubble {
  background-color: #E0F7FA; /* Soft blue shade */
  color: #555;
  align-self: flex-end;
}

.chat-end .chat-bubble::before {
  content: "";
  position: absolute;
  top: 50%;
  right: -10px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-left-color: #E0F7FA;
  transform: translateY(-50%);
}

/* Styling for the "other" role */
.chat-start .chat-bubble {
  background-color: #FCE4EC; /* Soft pink shade */
  color: #555;
  align-self: flex-start;
}

.chat-start .chat-bubble::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -10px;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  border-right-color: #FCE4EC;
  transform: translateY(-50%);
}
</style>
