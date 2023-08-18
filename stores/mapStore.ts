import { LngLat } from "mapbox-gl";
import { defineStore } from "pinia";

export enum MapStatus {
  INITIAL,
  GENERATE_ROUTE,
}

export class Route {
  public start?: LngLat;
  public end?: LngLat;
}

export const useMapStore = defineStore("map", {
  state: () => ({
    status: MapStatus.INITIAL,
    route: new Route(),
  }),

  getters:  {
    getStatus: (state) => state.status,
    getRoute : (state) => state.route,
  },

  actions: {
    setStatus(status: MapStatus) {
      this.status = status;
    },
    setRoute(route: Route) {
      this.route = route;
    },
    setStart(start: LngLat) {
      this.route.start = start;
    },
    setEnd(end: LngLat) {
      this.route.end = end;
    }
  },
});
