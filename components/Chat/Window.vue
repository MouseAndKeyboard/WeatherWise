<template>
  <div class="w-full h-[100vh] shadow shadow-gray-600 rounded-lg overflow-hidden flex flex-col bg-black">
    <header
      class="w-full h-10 flex-none bg-gradient-to-r flex items-center justify-between px-3 from-purple-600 to-violet-600">
      <h1 class="text-lg text-gray-50 font-semibold">CHAT</h1>
    </header>;

    <div class="messages flex flex-col h-full h-[50vh] space-y-4 w-full overflow-x-hidden overflow-y-auto py-8 scroll-smooth" ref="messageContainer">
      <Bubble v-for="(message, index) in messages" :key="index" :role="message.role">
        <span v-html="message.content">
        </span>
      </Bubble>
      <Bubble v-if="typing" role="assistant">
        <Typing />
      </Bubble>
    </div>

    <div class="flex flex-col space-y-2 h-[30vh]">
        <button v-text="option1" @click="setOption(option1)" class="p-2 bg-blue-500 text-white rounded-md w-full"></button>
        <button v-text="option2" @click="setOption(option2)" class="p-2 bg-blue-500 text-white rounded-md w-full"></button>
        <button v-text="option3" @click="setOption(option3)" class="p-2 bg-blue-500 text-white rounded-md w-full"></button>
    </div>



    <form @submit.prevent="sendMessage" class="flex items-center mt-auto h-[10vh]">
      <button @click.prevent="transcribeAudio" class="btn btn-md btn-primary rounded-none">
        <div class="">
          <MicrophoneIcon class="h-5 w-5 fill-white" />
        </div>

      </button>
      <input v-model="messageText" type="text"
        class="w-full py-6 px-3 h-10 bg-gray-900 text-purple-200 border border-gray-900 placeholder:text-gray-600 outline-none focus:outline-none transition-all duration-150 ease-in-out focus:border-purple-600"
        placeholder="Enter your message here ..." />
      <button class="btn btn-md btn-primary rounded-none">
        <PaperAirplaneIcon class="h-6 w-6 fill-white -rotate-45" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { PaperAirplaneIcon } from "@heroicons/vue/24/solid"
import { MicrophoneIcon } from "@heroicons/vue/24/solid"

import { useChatbotStore } from "@/stores/chatbotStore"
import { list } from "postcss";

const chatbotStore = useChatbotStore()
const bot = chatbotStore.getBot
bot.initialise();
// await bot.nextStep();
// const firstQuestionStuff = await bot.nextStep();

const typing=ref(false)

type Message = {
  role: string;
  content: string;
};

const messageText = ref("");

const messages = ref<Message[]>([{role: 'assistant', 'content': firstQuestionStuff[0].content}]);

const option1 = ref(firstQuestionStuff[1].content)
const option2 = ref(firstQuestionStuff[2].content)
const option3 = ref(firstQuestionStuff[3].content)

const messageContainer = ref();

async function sendMessage() {
  console.log(messageText);
  if (!messageText.value.trim()) {
    // messageText.value is empty or only contains whitespace, so return early to prevent sending the message
    return;
  }
  
  messages.value = [...messages.value, { role: "user", content: messageText.value }];
  typing.value = true;
  messageText.value = "";
  
  setTimeout(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }, 500)
  
  let received = await callAI(messages.value);
  messages.value = [...messages.value, received[0]];

  option1.value = received[1].content
  option2.value = received[2].content
  option3.value = received[3].content

  typing.value = false;

  messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  console.log(messages.value);
}


function transcribeAudio( ) {

  messageText.value = "Transcribing audio..."
  return
}

async function callAI(messages: Message[]) {    
  return await bot.nextStep()
}

function setOption(option: string) {
  messageText.value = option
}

</script>