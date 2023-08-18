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

    let context: MessageContext = {
      threatLevel: 'Advice',
      adviceInfo: {
        headline: 'bushfire ADVICE has been issued for people within the vicinity of Wolfe Creek Crater National Park. ',
        lga: 'SHIRE OF HALLS CREEK',
        alertLine: 'There is a lot of smoke in the area. Although there is no immediate danger you need to be aware and keep up to date in case the situation changes. The fire started on adjacent land next to the park.',
      },
      firefighterInfo: {
        firefighterStatus: 'monitoring the situation'
      },
      roadClosureInfo: {
        areRoadsClosed: 'partial',
        closedRoads: ['Wolfe Creek Acces Road is closed from Tanami Road'],
      }
    };
    
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
