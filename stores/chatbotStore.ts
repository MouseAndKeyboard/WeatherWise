import { defineStore } from "pinia";
import { MessageContext } from "utils/chatgpt";


export const useChatbotStore = defineStore("chatbot", {
  state: () => ({
    botManager: new ChatInstance({threatLevel: 'Advice'}),
  }),

  getters:  {
    getBot: (state) => state.botManager,
  },

  actions: {
    setMessageContext(context: MessageContext) {
        this.botManager.messageContext = context;
    }
  },  
});
