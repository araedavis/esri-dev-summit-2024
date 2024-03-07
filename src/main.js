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
import * as agricultureCIMSymbol from "./agriculture-cim-symbol.json";
import * as plantCIMSymbol from "./plant-cim-symbol.json";

  
// Load calcite components
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.6.0/assets",
});

// Add api key to access basemaps service
esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

let pointGraphic;
let csaPickupsLayerView;
const map = new Map({
  basemap: "arcgis/community",
});

const view = new MapView({
  container: "viewDiv",
  map,
  center: [-122.676483, 45.523],
  zoom: 12,
  highlightOptions: {
    color: "#36DA43",
    haloOpacity: 0.75,
  },
  popup: {
    dockOptions: {
      buttonEnabled: false
    },
    visibleElements: {
      actionBar: false,
      collapseButton: false,
      featureNavigation: false
    },
  },
});

const csaRenderer = {
  type: "simple",
  symbol: {
    type: "cim",
    data: {
      type: "CIMSymbolReference",
      symbol: plantCIMSymbol
    },
  },
};

const csaPopup = {
  title: "{Farm_Name}",
  content:
    "<b>Pickup address: </b>{Location}<br/><br/><a href={Website}>View website</a>",
  
};

const graphicsLayer = new GraphicsLayer();

const csaPickupsLayer = new FeatureLayer({
  url: "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188",
  renderer: csaRenderer,
  popupTemplate: csaPopup
});

map.add(graphicsLayer);
map.add(csaPickupsLayer);

try {
  csaPickupsLayerView = await view.whenLayerView(csaPickupsLayer);
} catch (error) {
  console.log(error);
}


// calcite-input custom event; fires on submit/enter key press
document.addEventListener("calciteInputChange", async (event) => {
  const address = { singleLine: event.target.value };
  const serviceUrl =
    "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

  try {
    // use the Maps SDK's locator helper to call the REST API's geocoding service
    const locations = await addressToLocations(serviceUrl, { address });
    if (locations.length === 0) {
      return;
    }

    // Get the location from the top match
    const addressLocation = locations[0].toJSON().location;

    // Convert location's geometry to a point graphic and add to map
    addHomeGraphic(addressLocation)

    const buffer = createBuffer(pointGraphic);
    filterByLocation(buffer);
  } catch (error) {
    console.log(error)
  }
});

// calcite-slider custom event; fires only when slider's handle is released
document.addEventListener("calciteSliderChange", () => {
  if (!pointGraphic) {
    return;
  }
  const buffer = createBuffer(pointGraphic);
  filterByLocation(buffer);
});

function addHomeGraphic (location) {
  // Clear any previous point from the map
  graphicsLayer.removeAll();

  const { x, y } = location;

  pointGraphic = new Graphic({
    geometry: { type: "point", x, y },
    symbol: {
      type: "web-style",
      name: "house",
      styleName: "Esri2DPointSymbolsStyle",
    },
  });
  graphicsLayer.add(pointGraphic);
  view.goTo(pointGraphic);
}


function createBuffer (point) {
  const distance = document.getElementById("distance-slider").value;

  return geometryEngine.geodesicBuffer(
    point.geometry,
    distance,
    "miles"
  )
}

function filterByLocation (geometry) {
  if (!csaPickupsLayer) {
    return;
  }
  const featureFilter = {
    geometry,
    spatialRelationship: "intersects",
    units: "miles"
  };

  csaPickupsLayerView.featureEffect = {
    filter: featureFilter,
    excludedEffect: "grayscale(100%) opacity(60%)"
  }
}
