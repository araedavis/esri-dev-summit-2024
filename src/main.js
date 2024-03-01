/**
 * This example uses the Distribution build of Calcite Components.
 * Refer to the documentation if switching to the Custom Elements build:
 * https://developers.arcgis.com/calcite-design-system/get-started/#choose-a-build
 **/
import "@esri/calcite-components/dist/calcite/calcite.css";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";

/**
 * ES Modules from the JS Maps SDK
 */
import esriConfig from "@arcgis/core/config.js";
import Map from "@arcgis/core/Map.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js"


// load calcite components
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.6.0/assets",
});

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

const map = new Map({
  basemap: "arcgis/community",
});

const view = new MapView({
  container: "viewDiv",
  map,
  center: [-122.676483, 45.523],
  zoom: 12,
});

const csaRenderer = {
  type: "simple",
  symbol: {
    type: "web-style",
    name: "tear-pin-2",
    styleName: "Esri2DPointSymbolsStyle",
  },
};

const csaPickups = new FeatureLayer({
  url: "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188",
  renderer: csaRenderer
});

map.add(csaPickups);
