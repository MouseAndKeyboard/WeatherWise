<template>
  <div class="chat-container flex flex-col w-full overflow-hidden bg-[#e1e1e1]">
    <div class="flex flex-col w-full h-full py-8 space-y-4 overflow-x-hidden overflow-y-auto messages scroll-smooth"
      ref="messageContainer">
      <Bubble v-for="(message, index) in filteredMessages" :key="index" :role="message.role"
        :class="[message.role === 'user' ? 'user-bubble' : 'assistant-bubble']">
        <span v-html="message.content"></span>
        <br />
        <span class="timestamp">12:30 PM</span>
        <button v-if="message.hasbutton" @click="genroutehandler()"
          class="btn btn-md btn-primary bg-red-500 border border-red-800 hover:bg-red-600 hover:border hover:border-red-800">Generate
          Evacuation Route</button>
      </Bubble>

      <Bubble v-if="typing" role="assistant">
        <Typing />
      </Bubble>
      <div class="chat-divider"></div>
    </div>

    <div class="flex flex-col mb-2 space-y-2">

      <!-- Option 1 Button -->
      <button v-if="option1" v-text="option1" @click="setOption(option1)"
        class="w-full p-2 text-black bg-[#70ABE8] rounded-md hover:bg-[#57CD5F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#5CC89B] shadow-md">
      </button>

      <!-- Option 2 Button -->
      <button v-if="option2" v-text="option2" @click="setOption(option2)"
        class="w-full p-2 text-black bg-[#70ABE8] rounded-md hover:bg-[#57CD5F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#5CC89B] shadow-md">
      </button>

      <!-- Option 3 Button -->
      <button v-if="option3" v-text="option3" @click="setOption(option3)"
        class="w-full p-2 text-black bg-[#70ABE8] rounded-md hover:bg-[#57CD5F] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#5CC89B] shadow-md">
      </button>
    </div>


    <form @submit.prevent="sendMessage" class="flex items-center bg-[#70ABE8] py-2 px-4 rounded-lg shadow-md">

      <!-- Microphone Button -->
      <button @click.prevent="toggleRecording"
        class="bg-[#5CC89B] p-2 rounded-full hover:bg-[#57CD5F] transition-all duration-150 focus:outline-none shadow-md">
        <MicrophoneIcon v-if="recording" class="w-5 h-5 text-red-500" />
        <MicrophoneIcon v-else class="w-5 h-5 text-white" />
      </button>

      <!-- Spacer between microphone and input -->
      <div class="mx-2"></div>

      <!-- Text Input -->
      <input v-model="messageText" type="text"
        class="flex-grow p-2 rounded-md text-black placeholder-text-gray-600 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-[#57CD5F] transition-all duration-150"
        placeholder="Enter your message here ...">

      <!-- Spacer between input and send button -->
      <div class="mx-2"></div>

      <!-- Send Button -->
      <button
        class="bg-[#5CC89B] p-2 rounded-full hover:bg-[#57CD5F] transition-all duration-150 focus:outline-none shadow-md">
        <PaperAirplaneIcon v-if="typing" class="w-6 h-6 text-gray-500 -rotate-45" />
        <PaperAirplaneIcon v-else class="w-6 h-6 text-white -rotate-45" />
      </button>

    </form>
  </div>
</template>

<style scoped>
/* Chat Container */

.chat-container {
  background: linear-gradient(180deg, #82eddb, #a1f7e9); /* subtle gradient from aqua to light gray */
  padding: 1rem;
  overflow: hidden; /* keep child content within rounded corners */
}

.chat-divider {
  height: 1px;
  background-color: rgba(87, 205, 95, 0.2);
  /* green with transparency */
  margin: 0.5rem 0;
}

/* User Chat Bubbles */
.user-bubble {
  background-color: #70ABE8;
  color: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Assistant Chat Bubbles */
.assistant-bubble {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Special Assistant Messages */
.special-message {
  background-color: #5CC89B;
  color: white;
  border-radius: 15px;
}

/* Timestamps */
.timestamp {
  color: #AAAAAA;
  font-size: 12px;
}

/* Scrollbar Styling */
.messages::-webkit-scrollbar {
  width: 6px;
}

.messages::-webkit-scrollbar-track {
  background: #F5F5F5;
}

.messages::-webkit-scrollbar-thumb {
  background-color: #57CD5F;
  border-radius: 20px;
}

/* Links & Actionable Items */
a {
  color: #5CC89B;
  transition: underline 0.3s ease;
}

a:hover {
  text-decoration: underline;
}
</style>


<script setup lang="ts">
import { PaperAirplaneIcon } from "@heroicons/vue/24/solid"
import { MicrophoneIcon } from "@heroicons/vue/24/solid"

import { useChatbotStore } from "@/stores/chatbotStore"
import { list } from "postcss";
import { ChatCompletionRequestMessage } from "openai";
import { onMounted, computed } from 'vue'
import { MapStatus, useMapStore } from "@/stores/mapStore";
import { LngLat } from "mapbox-gl";

const chatbotStore = useChatbotStore()
const bot = chatbotStore.getBot

const firstQuestionStuff = ref([
  { 'role': 'assistant', 'content': "" },


  { 'role': 'assistant', 'content': "..." },
  { 'role': 'assistant', 'content': "..." },
  { 'role': 'assistant', 'content': "..." },
])

const typing = ref(true)

type Message = {
  role: string;
  content: string;
};

const filteredMessages = computed(() => messages.value.filter(message => message.content.trim().length > 0));

const messageText = ref("");

const messages = ref<ChatCompletionRequestMessage[]>([{ role: 'assistant', 'content': firstQuestionStuff.value[0].content }]);

const option1 = ref(firstQuestionStuff.value[1].content)
const option2 = ref(firstQuestionStuff.value[2].content)
const option3 = ref(firstQuestionStuff.value[3].content)

const messageContainer = ref();

const recording = ref(false);
const mediaRecorderRef = ref<MediaRecorder | null>(null); // Reference to the MediaRecorder object

async function sendMessage() {
  console.log(messageText);
  if (!messageText.value.trim() || typing.value) {
    // messageText.value is empty or only contains whitespace, so return early to prevent sending the message
    return;
  }

  messages.value = [...messages.value, { role: "user", content: messageText.value }];
  typing.value = true;
  messageText.value = "";

  setTimeout(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }, 500)

  let b = bot.phase == "recommending"
  let received = await callAI(messages.value);

  if (b) {
    // we need to display the "generate route" button.
    received[0].hasbutton = true;
  } else {
    received[0].hasbutton = false;
  }

  messages.value = [...messages.value, received[0]];

  option1.value = received[1].content
  option2.value = received[2].content
  option3.value = received[3].content

  typing.value = false;

  messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  console.log(messages.value);
}


function toggleRecording() {
  if (recording.value) {
    stopRecording();
  } else {
    startRecording();
    messageText.value = "Transcribing audio..."
  }
}

function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });

        messageText.value = await transcribe(new File([blob], "audio.webm"));
      });

      mediaRecorderRef.value = mediaRecorder;
      mediaRecorder.start();
      recording.value = true;
    })
    .catch((error) => {
      console.error('Error accessing microphone:', error);
    });
}

function stopRecording() {
  recording.value = false;
  if (mediaRecorderRef.value) {
    mediaRecorderRef.value.stop();
    mediaRecorderRef.value = null;
  }
}

async function transcribe(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    headers: {
      Authorization: "Bearer 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",
    },
    method: "POST",
    body: formData
  });

  const transcript = await res.json();

  return transcript.text;
}


async function callAI(messages: ChatCompletionRequestMessage[]) {
  option1.value = "..."
  option2.value = "..."
  option3.value = "..."

  return await bot.nextStep(messages)
}

function setOption(option: string) {
  messageText.value = option
}

function genroutehandler() {
  const mapStore = useMapStore()
  mapStore.setStatus(MapStatus.GENERATE_ROUTE)
  mapStore.setEnd(new LngLat(115.872650, -31.954604));
  console.log("generating route")

  useRouter().push('/')
}

function log(typing: boolean) {
  console.log(typing)
}

onMounted(async () => {
  // Initialize chatbot and move to first step
  bot.initialise()

  await bot.nextStep()

  // Fetch and update the actual value
  firstQuestionStuff.value = await bot.nextStep()

  typing.value = false

  messages.value = [{ role: 'assistant', 'content': firstQuestionStuff.value[0].content.replace(/^[^a-zA-Z]*/, '') }];
  option1.value = firstQuestionStuff.value[1].content.replace(/^[^a-zA-Z]*/, '');
  option2.value = firstQuestionStuff.value[2].content.replace(/^[^a-zA-Z]*/, '');
  option3.value = firstQuestionStuff.value[3].content.replace(/^[^a-zA-Z]*/, '');


})
</script>


