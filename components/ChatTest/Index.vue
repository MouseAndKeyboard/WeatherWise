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
      threatLevel: 'Emergency',
      emergencyInfo: {
        headline: 'bushfire EMERGENCY has been issued for people within the vicinity of Perth City. ',
        lga: 'CITY OF PERTH',
        alertLine: 'There is a lot of smoke in the area. Multiple buildings on fire evacuate immediately if possible. The fire started due to arson in Northbridge.',
        homesUnderThreat: 'Yes'
      },
      firefighterInfo: {
        firefighterStatus: 'on the scene',
        numberOfFirefighters: 28,
        aerialSupport: 'Yes',
        lostItems: 'Various businesses and apartment buildings',
      },
      roadClosureInfo: {
        areRoadsClosed: 'partial',
        closedRoads: ['Saint Georges Terrace', 'William Street'],
      },
      otherAgencyInfo: {
        'powerMessages': 'General power outage in the Perth area'
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
