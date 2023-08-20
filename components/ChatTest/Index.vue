<template>
  <div>
    <button @click="sendFirstMessage">Get Initial Message</button>
    <p>{{initialPrompt}}</p>
  </div>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue';
import { ChatInstance, MessageContext } from '../../utils/chatgpt';

export default {
  setup() {

    let context: MessageContext = [];
    
    const chatGPT = new ChatInstance(context);

    const initialPrompt = ref('');

    const sendFirstMessage = () => {
      initialPrompt.value = chatGPT.getInitialMessage();
    };

    onMounted(() => {
      // Initialize the chatbot or do anything else when the component is mounted
      chatGPT.initialise();
      console.log(chatGPT);
    });

    return {
      initialPrompt,
      sendFirstMessage,
    };
  },
};
</script>
