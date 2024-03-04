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
import esriConfig from "@arcgis/core/config";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { addressToLocations } from "@arcgis/core/rest/locator";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";


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

const csaPickupsLayer = new FeatureLayer({
  url: "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188",
  renderer: csaRenderer
});

map.add(csaPickupsLayer);
const csaPickupsLayerView = await view.whenLayerView(csaPickupsLayer);


let pointGraphic;
const graphicsLayer = new GraphicsLayer();
map.add(graphicsLayer);

const slider = document.getElementById("distance");


// calcite-input custom event; fires on submit/enter key press
document.addEventListener("calciteInputChange", async (event) => {
  const address = { singleLine: event.target.value };
  const serviceUrl =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  const locations = await addressToLocations(serviceUrl, { address })

  if (locations.length === 0) {
    return;
  }

  // Clear any previous point from the map
  graphicsLayer.removeAll();

  // Create a point geometry and graphic from the best location match
  const { x, y } = locations[0].toJSON().location;
  pointGraphic = new Graphic({
    geometry: { type: "point", x, y },
    symbol: {
      type: "web-style",
      name: "house",
      styleName: "Esri2DPointSymbolsStyle"
    }
  });
  graphicsLayer.add(pointGraphic);
  view.goTo(pointGraphic);

  const buffer = createBuffer(pointGraphic);
  filterByLocation(buffer);
});

document.addEventListener("calciteSliderChange", () => {
  if (!pointGraphic) {
    return;
  }
  const buffer = createBuffer(pointGraphic);
  filterByLocation(buffer);
});

document.addEventListener("calciteComboboxChange", e => {
  // filterByProduct(e);
})


function createBuffer (point) {
  const distance = slider.value;

  return geometryEngine.geodesicBuffer(
    point.geometry,
    distance,
    "miles"
  )
}

function filterByLocation (geometry) {
  const featureFilter = {
    geometry,
    spatialRelationship: "intersects",
    units: "miles"
  };
  if (csaPickupsLayerView) {
    csaPickupsLayerView.featureEffect = {
      filter: featureFilter,
      excludedEffect: "grayscale(100%) opacity(30%)"
    }
  }  
}

// function filterByProduct(event) {
//   console.log(event.target.value);
//   csaPickupsLayer.filter = {
//     where: ""
//   }
// }
