<template>
  <div class="flex flex-col w-full overflow-hidden bg-[#e1e1e1]">
    <div class="flex flex-col w-full h-full py-8 space-y-4 overflow-x-hidden overflow-y-auto messages scroll-smooth" ref="messageContainer">
      <Bubble 
        v-for="(message, index) in filteredMessages" 
        :key="index" 
        :role="message.role" 
      >
        <span v-html="message.content"></span>
        <br />
        <button v-if="message.hasbutton" @click="genroutehandler()" class="btn btn-md btn-primary">Generate Evacuation Route</button>
      </Bubble>
      <Bubble v-if="typing" role="assistant">
        <Typing />
      </Bubble>

    </div>

    <div class="flex flex-col mb-2 space-y-2">
        <button v-if="option1" v-text="option1" @click="setOption(option1)" class="w-full p-2 text-black bg-white rounded-md"></button>
        <button v-if="option2" v-text="option2" @click="setOption(option2)" class="w-full p-2 text-black bg-white rounded-md"></button>
        <button v-if="option3" v-text="option3" @click="setOption(option3)" class="w-full p-2 text-black bg-white rounded-md"></button>
    </div>



    <form @submit.prevent="sendMessage" class="flex items-center mt-auto h-[10vh]">
      <button @click.prevent="toggleRecording" class="rounded-none btn btn-md btn-primary bg-blue-400 border border-blue-800 hover:bg-blue-500">
        <div class="">
          <MicrophoneIcon v-if="recording" class="w-5 h-5 text-red-500" />
          <MicrophoneIcon v-else class="w-5 h-5 fill-white" />
        </div>

      </button>
      <input v-model="messageText" type="text"
        class="w-full h-10 px-3 py-6 text-black transition-all duration-150 ease-in-out bg-gray-50 border border-gray-500 outline-none placeholder:text-gray-600 focus:outline-none focus:border-gray-900"
        placeholder="Enter your message here ..."
        @keydown.enter.prevent="sendMessage"/>
      <button class="rounded-none btn btn-md btn-primary bg-blue-400 border border-blue-800 hover:bg-blue-500">
        <PaperAirplaneIcon v-if="typing" class="w-6 h-6 -rotate-45 text-gray-500" />
        <PaperAirplaneIcon v-else class="w-6 h-6 -rotate-45 fill-white" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { PaperAirplaneIcon } from "@heroicons/vue/24/solid"
import { MicrophoneIcon } from "@heroicons/vue/24/solid"

import { useChatbotStore } from "@/stores/chatbotStore"
import { list } from "postcss";
import { ChatCompletionRequestMessage } from "openai";
import { onMounted, computed } from 'vue'

const chatbotStore = useChatbotStore()
const bot = chatbotStore.getBot

const firstQuestionStuff = ref([
        {'role': 'assistant', 'content': ""},


        {'role': 'assistant', 'content': "..."},
        {'role': 'assistant', 'content': "..."},
        {'role': 'assistant', 'content': "..."}, 
      ])

const typing=ref(true)

type Message = {
  role: string;
  content: string;
};

const filteredMessages = computed(() => messages.value.filter(message => message.content.trim().length > 0));

const messageText = ref("");

const messages = ref<ChatCompletionRequestMessage[]>([{role: 'assistant', 'content': firstQuestionStuff.value[0].content}]);

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

  let b = bot.phase == "reccomending"
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
		formData.append("file",file);
		formData.append("model","whisper-1");
		formData.append("language","en");
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

  messages.value = [{role: 'assistant', 'content': firstQuestionStuff.value[0].content.replace(/^[^a-zA-Z]*/, '')}];
  option1.value = firstQuestionStuff.value[1].content.replace(/^[^a-zA-Z]*/, '');
  option2.value = firstQuestionStuff.value[2].content.replace(/^[^a-zA-Z]*/, '');
  option3.value = firstQuestionStuff.value[3].content.replace(/^[^a-zA-Z]*/, '');


})
</script>
