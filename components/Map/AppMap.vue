<template>
  <div id="map"></div>
</template>

<script setup lang="ts">
import mapboxgl, { LngLat, LngLatLike } from "mapbox-gl";
import { onMounted } from "vue";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import fireArea from "@/data/fire_area.json";
import emergencyWarningArea from "@/data/emergency_warning_area.json";
import watchAndActArea from "@/data/watch_and_act_area.json";
import adviceArea from "@/data/advice_area.json";
import messageWarnings from "@/data/message_warnings.json";
import * as turf from "@turf/turf";
import * as polyline from "@mapbox/polyline";
import { MapStatus, useMapStore } from "@/stores/mapStore";

const accessToken =
  "pk.eyJ1IjoiY2puYmVubmV0dCIsImEiOiJjbGhsaTRxc2EwOWw3M3FwOTQ0N3luaW5qIn0.8XbLwV61cr2oFs7ue0wCCw";
const westernAustralia: [number, number] = [121.8997, -25.5528];
const bounds: [number, number, number, number] = [
  104.9211, -42.1406, 136.0019, -6.6683,
];

mapboxgl.accessToken = accessToken;

const mapStore = useMapStore();

onMounted(() => {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/satellite-v9",
    center: westernAustralia,
    maxBounds: bounds,
    minZoom: 0,
  });

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: "metric",
    profile: "mapbox/driving",
    alternatives: false,
    geometries: "geojson",
    controls: { instructions: false },
    iteractive: false,
    flyTo: false,
  });

  if (mapStore.status == MapStatus.GENERATE_ROUTE) {
    map.addControl(directions, "top-left");
  }
  map.scrollZoom.enable();

  map.on("load", () => {
    if (mapStore.status == MapStatus.INITIAL) {
      setTimeout(() => {
        map.flyTo({
          center: mapStore.getRoute.start,
          zoom: 6,
        });
      }, 1000);
    }

    const { $event, $listen } = useNuxtApp();

    $listen("focusSelf", () => {
      map.flyTo({
        center: mapStore.getRoute.start,
        zoom: 12,
        essential: true,
      });
    });
    map.addSource("fireArea", {
      type: "geojson",
      data: fireArea as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
    });

    map.addSource("emergencyWarning", {
      type: "geojson",
      data: emergencyWarningArea as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
    });

    map.addLayer({
      id: "emergencyWarning",
      type: "fill",
      source: "emergencyWarning",
      paint: {
        "fill-color": "#D42028",
        "fill-opacity": 0.8,
      },
    });

    map.addLayer({
      id: "fireArea",
      type: "fill",
      source: "fireArea",
      paint: {
        "fill-color": "#000000",
        "fill-opacity": 1,
      },
    });

    map.addSource("watchAndAct", {
      type: "geojson",
      data: watchAndActArea as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
    });

    map.addLayer({
      id: "watchAndAct",
      type: "fill",
      source: "watchAndAct",
      paint: {
        "fill-color": "#F27921",
        "fill-opacity": 0.8,
      },
    });

    map.addSource("advice", {
      type: "geojson",
      data: adviceArea as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
    });

    map.addLayer({
      id: "advice",
      type: "fill",
      source: "advice",
      paint: {
        "fill-color": "#F9DF2C",
        "fill-opacity": 0.8,
      },
    });

    const el = document.createElement("div");
    el.className =
      "marker w-4 h-4 bg-blue-500 rounded-full border-2 border-white";

    new mapboxgl.Marker({ color: "red" })
      .setLngLat(messageWarnings.features[0].geometry.coordinates as LngLatLike)
      .addTo(map);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position)
        let currentPos = new LngLat(
          115.8588576,
          -31.9560394
        );
        const el = document.createElement("div");
        el.className =
          "marker w-4 h-4 bg-blue-500 rounded-full border-2 border-white";
        new mapboxgl.Marker(el).setLngLat(currentPos).addTo(map);
      },
      (error) => {
        console.log(error.message);
      }
    );

    if (mapStore.status == MapStatus.INITIAL) {
      return;
    }

    directions.setOrigin([
      mapStore.getRoute.start?.lng,
      mapStore.getRoute.start?.lat,
    ]);
    directions.setDestination([
      mapStore.getRoute.end?.lng,
      mapStore.getRoute.end?.lat,
    ]);

    // convert to turf polygon
    const obstacle = turf.polygon(
      emergencyWarningArea.features[0].geometry.coordinates
    );

    map.addSource("theRoute", {
      type: "geojson",
      data: {
        type: "Feature",
      } as GeoJSON.Feature<GeoJSON.LineString>,
    });

    map.addLayer({
      id: "theRoute",
      type: "line",
      source: "theRoute",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#cccccc",
        "line-opacity": 1,
        "line-width": 13,
        "line-blur": 0.5,
      },
    });

    // Source and layer for the bounding box
    map.addSource("theBox", {
      type: "geojson",
      data: {
        type: "Feature",
      } as GeoJSON.Feature<GeoJSON.Polygon>,
    });
    map.addLayer({
      id: "theBox",
      type: "fill",
      source: "theBox",
      layout: {},
      paint: {
        "fill-color": "#FFC300",
        "fill-opacity": 0.5,
        "fill-outline-color": "#FFC300",
      },
    });

    let counter = 0;

    directions.on("clear", () => {
      map.setLayoutProperty("theRoute", "visibility", "none");
      map.setLayoutProperty("theBox", "visibility", "none");

      counter = 0;
    });

    directions.on("route", (e: any) => {
      map.setLayoutProperty("theRoute", "visibility", "none");
      map.setLayoutProperty("theBox", "visibility", "none");

      if (counter < 100) {
        // Make each route visible
        for (const route of e.route) {
          map.setLayoutProperty("theRoute", "visibility", "visible");
          map.setLayoutProperty("theBox", "visibility", "visible");

          const routeLine = polyline.toGeoJSON(route.geometry);
          let bbox = turf.bbox(routeLine);
          let polygon = turf.bboxPolygon(bbox);

          map.getSource("theRoute").setData(routeLine);
          map.getSource("theBox").setData(polygon);

          const isIntersection = !turf.booleanDisjoint(obstacle, routeLine);

          if (isIntersection) {
            // Collision occurred, so increment the counter
            counter += 1;
            polygon = turf.transformScale(polygon, counter * 0.05);
            bbox = turf.bbox(polygon);
            map.setPaintProperty("theRoute", "line-color", "#de2d26");

            const randomWaypoint = turf.randomPoint(1, { bbox: bbox });

            directions.setWaypoint(
              0,
              randomWaypoint["features"][0].geometry.coordinates
            );
          } else {
            counter = 0;
            map.setPaintProperty("theRoute", "line-color", "#74c476");
            map.setLayoutProperty("theBox", "visibility", "none");
          }
        }
      } else {
        directions.removeRoutes();
      }
    });
  });
});
</script>
