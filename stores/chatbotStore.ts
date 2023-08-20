import { defineStore } from "pinia";
import { MessageContext } from "utils/chatgpt";


export const useChatbotStore = defineStore("chatbot", {
  state: () => ({
    botManager: new ChatInstance([
      {
        "type": "Feature",
        "id": 1, "geometry":
          { "type": "Point", "coordinates": [148.036562, -25.853552] },
        "properties":
        {
          "OBJECTID": 1,
          "Master_Incident_Number": "QF3-23-089439",
          "Response_Date": 1691215233000,
          "LastUpdate": 1692079448000,
          "CurrentStatus": "Going",
          "Location": "Mount Moffatt Rd",
          "Jurisdiction": "3 South Western Region",
          "Latitude": -25.853552,
          "Longitude": 148.036562,
          "VehiclesAssigned": 0,
          "VehiclesOnRoute": 0,
          "VehiclesOnScene": 0,
          "FMETimestamp": 1692468722000,
          "GroupedType": "FIRE VEGETATION",
          "Locality": "FORESTVALE"
        }
      }, { "type": "Feature", "id": 2, "geometry": { "type": "Point", "coordinates": [153.436089, -27.637325] }, "properties": { "OBJECTID": 2, "Master_Incident_Number": "QF5S-23-091109", "Response_Date": 1691537843000, "LastUpdate": 1692434560000, "CurrentStatus": "Going", "Location": "UNNAMED NORTH STRADBROKE ISLAND RD", "Jurisdiction": "5N Brisbane Region (North)", "Latitude": -27.637325, "Longitude": 153.436089, "VehiclesAssigned": 0, "VehiclesOnRoute": 0, "VehiclesOnScene": 1, "FMETimestamp": 1692468722000, "GroupedType": "FIRE PERMITTED BURN", "Locality": "NORTH STRADBROKE ISLAND" } }, { "type": "Feature", "id": 3, "geometry": { "type": "Point", "coordinates": [152.347694, -28.20496] }, "properties": { "OBJECTID": 3, "Master_Incident_Number": "QF3-23-091148", "Response_Date": 1691541691000, "LastUpdate": 1692260431000, "CurrentStatus": "Patrolled", "Location": "UPPER EMU CREEK RD", "Jurisdiction": "3 South Western Region", "Latitude": -28.20496, "Longitude": 152.347694, "VehiclesAssigned": 0, "VehiclesOnRoute": 0, "VehiclesOnScene": 0, "FMETimestamp": 1692468722000, "GroupedType": "FIRE PERMITTED BURN", "Locality": "EMU VALE" } }
    ]),
  }),

  getters: {
    getBot: (state) => state.botManager,
  },

  actions: {
    setMessageContext(context: MessageContext) {
      this.botManager.messageContext = context;
    }
  },
});
