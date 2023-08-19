import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

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
      "model": "gpt-3.5-turbo",
      "messages": cleanhist
    });

    console.log(completion);

    return completion.data.choices[0].message;
  } catch (error) {
    console.error(error);
  }
}

interface FireBehavior {
  fireSpeed?: 'fast' | 'slow';
  fireDirection?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  fireSpeedExact?: number;
  fireType?: 'smallControllable' | 'outOfControlUnpredictable' | 'ContainedButNotControlled' | 'ControlledButNotContained' | 'ContainedAndUnderControl' | 'Unpredictable';
  fireFrontSize?: number;
  fireHeight?: 'higherThanRooftops' | 'BurningIntoTreetops';
  windChangeExpected?: 'No' | 'YesWindShift' | 'YesWindChange';
  windChangeTime?: number;
  currentWindDirection?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  forecastWindDirection?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  emberAttack?: 'No' | 'Yes' | string; // string can be used to specify the distance of spot fires
  potentialThreat?: string; // freetext field for potential threats
  catastrophicFireDanger?: 'yes' | 'no';
  additionalInfo?: string; // freetext field for additional information
}

interface FirefighterInfo {
  firefighterStatus?: 'on their way' | 'on the scene' | 'patrolling the area and mopping up' | 'strengthening containment lines' | 'actively fighting the fire' | 'monitoring the situation' | 'monitoring the area for the rest of the day/night' | string; // string can be used to input the specific street names
  numberOfFirefighters?: number;
  typeOfFirefighters?: 'FRS' | 'VFRS' | 'VFES' | 'BFS' | 'DBCA' | 'Pastoralists';
  aerialSupport?: 'Yes' | 'No' | 'protecting crews and homes' | 'assisting ground crews' | 'released from incident';
  savedItems?: string; // freetext field for what has been saved
  lostItems?: string; // freetext field for what has been lost
  canInfoBeReleased?: 'yes' | 'no';
  otherStakeholders?: 'SES' | 'WA Police' | 'St John Ambulance' | 'Local Govt' | 'Other' | string; // string can be used to specify other stakeholders
}

interface RoadClosureInfo {
  areRoadsClosed?: 'yes' | 'no' | 'partial';
  closedRoads?: string[]; // array of road names
}

interface OtherAgencyInfo {
  healthMessages?: string; // freetext field for health messages
  powerMessages?: string; // freetext field for power messages
  waterMessages?: string; // freetext field for water messages
  telecommunicationsMessages?: string; // freetext field for telecommunications messages
  schoolMessages?: string; // freetext field for school messages
  insuranceMessage?: string; // freetext field for insurance messages
  redCrossLineActivated?: 'yes' | 'no';
}

interface EmergencyInfo {
  headline?: string; // freetext field for headline, e.g., "Bushfire Emergency Warning for eastern part of Suburb X"
  lga?: string; // freetext field for Local Government Area (LGA)
  alertLine?: string; // freetext field for the description of the affected warning area
  safeToLeave?: 'Yes' | 'No';
  sewsUsed?: 'Yes' | 'No'; // SEWS: Standard Emergency Warning Signal
  telephoneWarningIssued?: 'Yes' | 'No';
  homesUnderThreat?: 'Yes' | 'No' | string; // string can be used to specify the number of hours and what streets
  alertLevelUpgraded?: 'Yes' | 'No';
  upgradeReason?: string; // freetext field for the reason for alert level upgrade
}

interface WatchAndActInfo {
  headline?: string; // freetext field for headline
  lga?: string; // freetext field for Local Government Area (LGA)
  alertLine?: string; // freetext field for the description of the affected warning area
  safeToActivelyDefend?: 'Yes' | 'No';
  safeToLeave?: 'Yes' | 'No';
  alertLevelChange?: 'No' | 'Yes';
  changeReason?: string; // freetext field for reason of the alert level change
  evacuationCentreSetup?: 'No' | 'Yes';
  evacuationCentreLocation?: string; // freetext field for location of evacuation centre
  lastResortPlaceDesignated?: 'No' | 'Yes';
  lastResortPlaceLocation?: string; // freetext field for location of last resort place
  safestRouteToLeave?: string; // freetext field for the safest route to leave
}

interface AdviceInfo {
  headline?: string; // freetext field for headline
  lga?: string; // freetext field for Local Government Area (LGA)
  alertLine?: string; // freetext field for the description of the affected warning area
  nearHomesMessages?: string; // freetext field for messages related to being near homes or driving
  isSmokePresent?: 'Yes' | 'No';
  alertLevelDowngraded?: 'Yes' | 'No';
}

interface MessageContext {
  threatLevel: 'Emergency' | 'WatchAndAct' | 'Advice';
  emergencyInfo?: EmergencyInfo;
  watchAndActInfo?: WatchAndActInfo;
  adviceInfo?: AdviceInfo;

  bushfireBehavior?: FireBehavior;
  firefighterInfo?: FirefighterInfo;
  roadClosureInfo?: RoadClosureInfo;
  otherAgencyInfo?: OtherAgencyInfo;
}

class ChatInstance {
  chatHistory: ChatCompletionRequestMessage[];
  openai: OpenAIApi | undefined;
  messageContext: MessageContext;
  phase: 'waiting' | 'learning' | 'reccomending' | 'chatting';
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
      apiKey: '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',
    }));
  }

  receiveMessage(message: string) {
    this.chatHistory.push({ role: 'user', content: message });
  }

  getInitialMessage(demandQuestions = false): ChatCompletionRequestMessage {
    let initialPrompt = "I'm currently in a situation where ";

    switch (this.messageContext.threatLevel) {
      case 'Emergency':
        initialPrompt += 'there\'s an emergency warning (life and property are under threat). ';
        break;
      case 'WatchAndAct':
        initialPrompt += 'a watch and act alert has been issued (possible life and property are under threat). ';
        break;
      case 'Advice':
        initialPrompt += 'I\'ve received an advice message (no life and property under threat). ';
        break;
    }

    if (this.messageContext.bushfireBehavior) {
      initialPrompt += 'Here\'s what I know about the bushfire behavior: ';
      if (this.messageContext.bushfireBehavior.fireSpeed) {
        initialPrompt += `The fire speed is reported to be ${this.messageContext.bushfireBehavior.fireSpeed}. `;
      }
      if (this.messageContext.bushfireBehavior.fireDirection) {
        initialPrompt += `The fire is moving in the ${this.messageContext.bushfireBehavior.fireDirection} direction. `;
      }
      if (this.messageContext.bushfireBehavior.fireSpeedExact) {
        initialPrompt += `The exact speed of the fire is ${this.messageContext.bushfireBehavior.fireSpeedExact} kms/hr. `;
      }
      if (this.messageContext.bushfireBehavior.fireType) {
        initialPrompt += `The fire type is described as ${this.messageContext.bushfireBehavior.fireType}. `;
      }
      if (this.messageContext.bushfireBehavior.fireFrontSize) {
        initialPrompt += `The fire front is reported to be ${this.messageContext.bushfireBehavior.fireFrontSize} kms wide. `;
      }
      if (this.messageContext.bushfireBehavior.fireHeight) {
        initialPrompt += `The fire height is said to be ${this.messageContext.bushfireBehavior.fireHeight}. `;
      }
      if (this.messageContext.bushfireBehavior.windChangeExpected) {
        initialPrompt += `Wind change is expected: ${this.messageContext.bushfireBehavior.windChangeExpected}. `;
      }
      if (this.messageContext.bushfireBehavior.windChangeTime) {
        initialPrompt += `The expected time for wind change is in ${this.messageContext.bushfireBehavior.windChangeTime} minutes. `;
      }
      if (this.messageContext.bushfireBehavior.currentWindDirection) {
        initialPrompt += `The current wind direction is ${this.messageContext.bushfireBehavior.currentWindDirection}. `;
      }
      if (this.messageContext.bushfireBehavior.forecastWindDirection) {
        initialPrompt += `The forecasted wind direction is ${this.messageContext.bushfireBehavior.forecastWindDirection}. `;
      }
      if (this.messageContext.bushfireBehavior.emberAttack) {
        initialPrompt += `Regarding ember attack, the report says: ${this.messageContext.bushfireBehavior.emberAttack}. `;
      }
      if (this.messageContext.bushfireBehavior.potentialThreat) {
        initialPrompt += `The potential threats are: ${this.messageContext.bushfireBehavior.potentialThreat}. `;
      }
      if (this.messageContext.bushfireBehavior.catastrophicFireDanger) {
        initialPrompt += `Is there a catastrophic fire danger in place? ${this.messageContext.bushfireBehavior.catastrophicFireDanger}. `;
      }
      if (this.messageContext.bushfireBehavior.additionalInfo) {
        initialPrompt += `Additional information: ${this.messageContext.bushfireBehavior.additionalInfo}. `;
      }
    }

    if (this.messageContext.firefighterInfo) {
      initialPrompt += '\nAs for the firefighters: ';
      if (this.messageContext.firefighterInfo.firefighterStatus) {
        initialPrompt += `The firefighters are ${this.messageContext.firefighterInfo.firefighterStatus}. `;
      }
      if (this.messageContext.firefighterInfo.numberOfFirefighters) {
        initialPrompt += `There are ${this.messageContext.firefighterInfo.numberOfFirefighters} firefighters. `;
      }
      if (this.messageContext.firefighterInfo.typeOfFirefighters) {
        initialPrompt += `The type of firefighters present are ${this.messageContext.firefighterInfo.typeOfFirefighters}. `;
      }
      if (this.messageContext.firefighterInfo.aerialSupport) {
        initialPrompt += `Aerial support: ${this.messageContext.firefighterInfo.aerialSupport}. `;
      }
      if (this.messageContext.firefighterInfo.savedItems) {
        initialPrompt += `They've managed to save: ${this.messageContext.firefighterInfo.savedItems}. `;
      }
      if (this.messageContext.firefighterInfo.lostItems) {
        initialPrompt += `Sadly, some things were lost to the fire: ${this.messageContext.firefighterInfo.lostItems}. `;
      }
      if (this.messageContext.firefighterInfo.otherStakeholders) {
        initialPrompt += `Other stakeholders in attendance are ${this.messageContext.firefighterInfo.otherStakeholders}. `;
      }
    }

    if (this.messageContext.otherAgencyInfo) {
      initialPrompt += '\nAs for other agency information: ';
      if (this.messageContext.otherAgencyInfo.healthMessages) {
        initialPrompt += `Health messages: ${this.messageContext.otherAgencyInfo.healthMessages}. `;
      }
      if (this.messageContext.otherAgencyInfo.powerMessages) {
        initialPrompt += `Power messages: ${this.messageContext.otherAgencyInfo.powerMessages}. `;
      }
      if (this.messageContext.otherAgencyInfo.waterMessages) {
        initialPrompt += `Water messages: ${this.messageContext.otherAgencyInfo.waterMessages}. `;
      }
      if (this.messageContext.otherAgencyInfo.telecommunicationsMessages) {
        initialPrompt += `Telecommunications messages: ${this.messageContext.otherAgencyInfo.telecommunicationsMessages}. `;
      }
      if (this.messageContext.otherAgencyInfo.schoolMessages) {
        initialPrompt += `School messages: ${this.messageContext.otherAgencyInfo.schoolMessages}. `;
      }
      if (this.messageContext.otherAgencyInfo.insuranceMessage) {
        initialPrompt += `Insurance message: ${this.messageContext.otherAgencyInfo.insuranceMessage}. `;
      }
      if (this.messageContext.otherAgencyInfo.redCrossLineActivated) {
        initialPrompt += `Is the Red Cross State Enquiry Line activated? ${this.messageContext.otherAgencyInfo.redCrossLineActivated}. `;
      }
    }

    if (this.messageContext.roadClosureInfo) {
      initialPrompt += '\nRegarding road closures: ';
      if (this.messageContext.roadClosureInfo.areRoadsClosed) {
        initialPrompt += `Roads are currently ${this.messageContext.roadClosureInfo.areRoadsClosed}. `;
      }
      if (this.messageContext.roadClosureInfo.closedRoads && this.messageContext.roadClosureInfo.closedRoads.length > 0) {
        const roadList = this.messageContext.roadClosureInfo.closedRoads.join(', ');
        initialPrompt += `The following roads are closed: ${roadList}. `;
      }
    }

    if (this.messageContext.emergencyInfo) {
      initialPrompt += '\nOn the emergency status: ';

      if (this.messageContext.emergencyInfo.headline) {
        initialPrompt += `The current headline is "${this.messageContext.emergencyInfo.headline}". `;
      }

      if (this.messageContext.emergencyInfo.lga) {
        initialPrompt += `This is happening in ${this.messageContext.emergencyInfo.lga}. `;
      }

      if (this.messageContext.emergencyInfo.alertLine) {
        initialPrompt += `The alert line states "${this.messageContext.emergencyInfo.alertLine}". `;
      }

      if (this.messageContext.emergencyInfo.safeToLeave) {
        initialPrompt += `It is currently ${this.messageContext.emergencyInfo.safeToLeave === 'Yes' ? '' : 'not'} safe to leave. `;
      }

      if (this.messageContext.emergencyInfo.sewsUsed) {
        initialPrompt += `The Standard Emergency Warning Signal has ${this.messageContext.emergencyInfo.sewsUsed === 'Yes' ? '' : 'not'} been used. `;
      }

      if (this.messageContext.emergencyInfo.telephoneWarningIssued) {
        initialPrompt += `A telephone warning has ${this.messageContext.emergencyInfo.telephoneWarningIssued === 'Yes' ? '' : 'not'} been issued. `;
      }

      if (this.messageContext.emergencyInfo.homesUnderThreat) {
        initialPrompt += `Homes are ${this.messageContext.emergencyInfo.homesUnderThreat === 'Yes' ? '' : 'not'} under threat. `;
        if (typeof this.messageContext.emergencyInfo.homesUnderThreat === 'string') {
          initialPrompt += `Specifically, ${this.messageContext.emergencyInfo.homesUnderThreat}. `;
        }
      }

      if (this.messageContext.emergencyInfo.alertLevelUpgraded) {
        initialPrompt += `The alert level has ${this.messageContext.emergencyInfo.alertLevelUpgraded === 'Yes' ? '' : 'not'} been upgraded. `;
        if (this.messageContext.emergencyInfo.upgradeReason) {
          initialPrompt += `Reason for upgrade: ${this.messageContext.emergencyInfo.upgradeReason}. `;
        }
      }
    }

    if (this.messageContext.watchAndActInfo) {
      initialPrompt += '\nOn the watch and act status: ';

      if (this.messageContext.watchAndActInfo.headline) {
        initialPrompt += `The headline for this event is "${this.messageContext.watchAndActInfo.headline}".\n`;
      }
      if (this.messageContext.watchAndActInfo.lga) {
        initialPrompt += `This is happening in the local government area of ${this.messageContext.watchAndActInfo.lga}.\n`;
      }
      if (this.messageContext.watchAndActInfo.alertLine) {
        initialPrompt += `The alert line reads: "${this.messageContext.watchAndActInfo.alertLine}".\n`;
      }
      if (this.messageContext.watchAndActInfo.safeToActivelyDefend) {
        initialPrompt += `It is ${this.messageContext.watchAndActInfo.safeToActivelyDefend.toLowerCase()} to actively defend your home.\n`;
      }
      if (this.messageContext.watchAndActInfo.safeToLeave) {
        initialPrompt += `It is ${this.messageContext.watchAndActInfo.safeToLeave.toLowerCase()} to leave the area.\n`;
      }
      if (this.messageContext.watchAndActInfo.alertLevelChange) {
        initialPrompt += `The alert level has been ${this.messageContext.watchAndActInfo.alertLevelChange.toLowerCase()}.\n`;
      }
      if (this.messageContext.watchAndActInfo.changeReason) {
        initialPrompt += `The reason for this change is: ${this.messageContext.watchAndActInfo.changeReason}.\n`;
      }
      if (this.messageContext.watchAndActInfo.evacuationCentreSetup) {
        initialPrompt += `A temporary evacuation centre has been ${this.messageContext.watchAndActInfo.evacuationCentreSetup.toLowerCase()}.\n`;
      }
      if (this.messageContext.watchAndActInfo.evacuationCentreLocation) {
        initialPrompt += `The location of the evacuation centre is: ${this.messageContext.watchAndActInfo.evacuationCentreLocation}.\n`;
      }
      if (this.messageContext.watchAndActInfo.lastResortPlaceDesignated) {
        initialPrompt += `A safer place of last resort has been ${this.messageContext.watchAndActInfo.lastResortPlaceDesignated.toLowerCase()}.\n`;
      }
      if (this.messageContext.watchAndActInfo.lastResortPlaceLocation) {
        initialPrompt += `The location of the safer place is: ${this.messageContext.watchAndActInfo.lastResortPlaceLocation}.\n`;
      }
      if (this.messageContext.watchAndActInfo.safestRouteToLeave) {
        initialPrompt += `The safest route to leave is: ${this.messageContext.watchAndActInfo.safestRouteToLeave}.\n`;
      }
    }

    if (this.messageContext.adviceInfo) {
      if (this.messageContext.adviceInfo.headline) {
        initialPrompt += `The headline for this event is "${this.messageContext.adviceInfo.headline}".\n`;
      }
      if (this.messageContext.adviceInfo.lga) {
        initialPrompt += `This is happening in the local government area of ${this.messageContext.adviceInfo.lga}.\n`;
      }
      if (this.messageContext.adviceInfo.alertLine) {
        initialPrompt += `The alert line reads: "${this.messageContext.adviceInfo.alertLine}".\n`;
      }
      if (this.messageContext.adviceInfo.nearHomesMessages) {
        initialPrompt += `There are messages for those near homes or driving: ${this.messageContext.adviceInfo.nearHomesMessages}.\n`;
      }
      if (this.messageContext.adviceInfo.isSmokePresent) {
        initialPrompt += `There is ${this.messageContext.adviceInfo.isSmokePresent.toLowerCase()} smoke in the area.\n`;
      }
      if (this.messageContext.adviceInfo.alertLevelDowngraded) {
        initialPrompt += `The alert level has been ${this.messageContext.adviceInfo.alertLevelDowngraded.toLowerCase()}.\n`;
      }
    }

    if (demandQuestions) {
      initialPrompt += '\nWith that context, please ask me the most important 4 questions about my personal situation so that you know how to recommend an evacuation path. Please aim to ask questions which will be helpful in tailoring your recommendations.With that context, please ask me the most important 4 questions about my current situation to prepare me for the fire/fire evacuation. Please format as dotpoints.';
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
        this.phase = 'reccomending';
      }

      return [
        {'role': 'assistant', 'content': question.replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[0].replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[1].replace(/^[^a-zA-Z]*/, '')},
        {'role': 'assistant', 'content': sampleResponses[2].replace(/^[^a-zA-Z]*/, '')}, 
      ]

    } else if (this.phase === 'reccomending') {
      const promp: ChatCompletionRequestMessage = { role: 'user', content: 'I have finished answering all the questions. Please recommend me an evacuation plan. There are 3 possible evac points: 12 Dale Road, 16 Main St, 10 Hay St.' }
      chathiztory.push(promp);

      const reccomendation = await runCompletion(this.openai, chathiztory);
      const three: ChatCompletionRequestMessage[] = [promp, { 'role': 'assistant', 'content': reccomendation?.content }, {'role': 'user', 'content': 'Okay, based on this plan, please come up with 3 possible follow up questions. Dot points only.'}];
      const rezult = await runCompletion(this.openai, three);

      console.log(reccomendation);
      console.log(rezult);

      const butts = rezult?.content?.split('\n') || [];      

      console.log("ASDSASDAS")
      console.log(butts)

      this.phase = 'chatting';
      return [
        reccomendation,
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