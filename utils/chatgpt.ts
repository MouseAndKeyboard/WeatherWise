import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
const runtimeConfig = useRuntimeConfig()

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const runCompletion = async (openai: OpenAIApi, history: ChatCompletionRequestMessage[]) => {

  let cleanhist = [];
  // go through each element in the history and delete any fields other than content and role
  for (let i = 0; i < history.length; i++) {
    const element = history[i];
    cleanhist.push({ role: element.role, content: element.content });
  }

  try {
    const completion = await openai.createChatCompletion({
      "model": "gpt-4",
      "messages": cleanhist
    });

    console.log(completion);

    return completion.data.choices[0].message;
  } catch (error) {
    console.error(error);
  }
}

interface Feature {
  type: String;
  id: Number;
  geometry: {
    type: String;
    coordinates: [Number, Number];
  },
  properties: {
    OBJECTID: Number;
    Master_Incident_Number: String;
    Response_Date: Number;
    LastUpdate: Number; 
    CurrentStatus: String;
    Location: String;
    Jurisdiction: String;
    Latitude: Number;
    Longitude: Number;
    VehiclesAssigned: Number; 
    VehiclesOnRoute: Number; 
    VehiclesOnScene: Number;
    FMETimestamp: Number;
    GroupedType: String;
    Locality: String;
  }
}

type MessageContext = Feature[]; 

class ChatInstance {
  chatHistory: ChatCompletionRequestMessage[];
  openai: OpenAIApi | undefined;
  messageContext: MessageContext;
  phase: 'waiting' | 'learning' | 'recommending' | 'chatting';
  questions: string[];
  allSampleResponses: { [char: string]: string[] };
  currentQuestionIndex: number;

  constructor(messageContext: MessageContext) {
    this.chatHistory = [];
    this.messageContext = messageContext;
    this.phase = 'waiting';
    this.questions = [];
    this.allSampleResponses = {};
    this.currentQuestionIndex = 0;
  }

  initialise() {
    console.log("initialising openai");
    this.openai = new OpenAIApi(new Configuration({
      apiKey: runtimeConfig.public.oai_key,
    }));
    console.log(runtimeConfig.public.oai_key);
  }

  receiveMessage(message: string) {
    this.chatHistory.push({ role: 'user', content: message });
  }

  getInitialMessage(demandQuestions = false): ChatCompletionRequestMessage {
    let initialPrompt = `I am looking at map of ongoing incidents near me. There are ${this.messageContext.length} incidents near me.`; 

    

    for (let i = 0; i < this.messageContext.length; i++) {
      const incident = this.messageContext[i];
      initialPrompt += `\nIncident ${i + 1}.\n`;

      const properties = incident.properties;

      initialPrompt += `Incident type: ${properties.GroupedType}\n`;
      initialPrompt += `Location: ${properties.Location}\n`;
      initialPrompt += `Number of Firetrucks assigned to the incident: ${properties.VehiclesAssigned}\n`;
      initialPrompt += `Number of Firetrucks on route to the incidnet: ${properties.VehiclesOnRoute}\n`;
      initialPrompt += `Number of Firetrucks at the scene: ${properties.VehiclesOnScene}\n`;
      initialPrompt += `\n`;
    }    

    initialPrompt += "I live in Australia, please use metric, etc. I know no more specific information about the fire or surrounding information. But I can tell you about my current situation."

    if (demandQuestions) {
      initialPrompt += '\nWith that context, please ask me the most important 4 questions about my personal situation so that you know how to recommend an evacuation path. Please aim to ask questions which will be helpful in tailoring your recommendations.With that context, please ask me the most important 4 questions about my current situation to prepare me for the fire/fire evacuation. The fire is about 45 minutes away. Please format as dotpoints.';
    }
    
    const message: ChatCompletionRequestMessage = {
      role: 'user',
      content: initialPrompt,
    }

    return message;
  }

  async nextStep(chathiztory: ChatCompletionRequestMessage[] = []) {
    if (this.phase === 'waiting') {
      const initialPrompt = this.getInitialMessage(true);
      if (!this.openai) {
        return;
      }
      const messageHist = [initialPrompt];

      console.log(messageHist);


      const response = await runCompletion(this.openai, messageHist)

      if (!response) {
        alert('API call failed');
      } else {

        console.log(response);


        const questions = response.content?.split('\n') || [];
        if (!questions) {
          alert("Question format invalid")
          console.log(response);
        }

        console.log(questions);

        let allSampleResponses: { [char: string]: string[] } = {};
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];

          const quickResponses = await runCompletion(this.openai, [...messageHist, response, { 'role': 'user', 'content': `Consider the following question: ${question}. I want to give this question to someone, list 3 "quick response" options I can give. Bullet point only.` }]).then()
          const sampleResponses = quickResponses?.content?.split('\n') || [];
          allSampleResponses[question] = sampleResponses;
        }

        console.log(allSampleResponses);
        this.questions = questions;
        this.allSampleResponses = allSampleResponses;
      }

      this.phase = 'learning';
    } else if (this.phase === 'learning') {

      const question = this.questions[this.currentQuestionIndex];
      const sampleResponses = this.allSampleResponses[question];

      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.questions.length) {
        this.phase = 'recommending';
      }

      return [
        {'role': 'assistant', 'content': question.replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[0].replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[1].replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[2].replace(/^[^a-zA-Z]*/, '')}, 
      ]

    } else if (this.phase === 'recommending') {
      const promp: ChatCompletionRequestMessage = { role: 'user', content: 'I have finished answering all the questions. Please recommend me an evacuation plan. There is an evacuation location at Wellingtom Street, Perth WA 6004.' }
      // chathiztory.push(promp);

      const recommendation = await runCompletion(this.openai, [...chathiztory, promp]);
      const three: ChatCompletionRequestMessage[] = [promp, { 'role': 'assistant', 'content': recommendation?.content }, {'role': 'user', 'content': 'Okay, based on this plan, please come up with 3 possible follow up questions. Dot points only.'}];
      const rezult = await runCompletion(this.openai, three);

      console.log(recommendation);
      console.log(rezult);

      const butts = rezult?.content?.split('\n') || [];      

      console.log("ASDSASDAS")
      console.log(butts)

      this.phase = 'chatting';
      return [
        recommendation,
        { 'role': 'assistant', 'content': butts[0] },
        { 'role': 'assistant', 'content': butts[1] },
        { 'role': 'assistant', 'content': butts[2] },
      ]
    } else if (this.phase === 'chatting') {
      console.log("KKKKKKKKKKKKKKKKK");

      const history: ChatCompletionRequestMessage[] = [this.getInitialMessage(false), ...chathiztory];
      console.log(history);
      console.log("history above")
      const response: ChatCompletionRequestMessage = await runCompletion(this.openai, history);
      const sugg: ChatCompletionRequestMessage = await runCompletion(this.openai, [...chathiztory, response, { 'role': 'user', 'content': 'Okay based on this, please come up with 3 follow up questions. Dot points only.' }]);

      console.log(response);
      console.log(sugg);

      const butts = sugg?.content?.split('\n') || [];

      return [response,
        { 'role': 'assistant', 'content': butts[0] },
        { 'role': 'assistant', 'content': butts[1] },
        { 'role': 'assistant', 'content': butts[2] },
      ];
    }

    // const initialPrompt = this.getInitialMessage();
    // this.chatHistory.push(initialPrompt);
  }

  sendMessage(messageHist: ChatCompletionRequestMessage[]) {
    // based on the chat history, generate a response
    if (!this.openai) {
      return;
    }

    runCompletion(this.openai, messageHist).then((response) => {
      if (!response) {
        alert('API call failed');
      } else {
        return response;
      }
    });
  }

  getChatHistory() {
    return this.chatHistory;
  }
}

export { ChatInstance, MessageContext }