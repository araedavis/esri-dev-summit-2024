/**
 * ES Modules from the JS Maps SDK
 */

import esriConfig from '@arcgis/core/config.js';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';

/**
 * This example uses the Custom Elements build of Calcite Components.
 * Refer to the documentation if switching to the Distribution build:
 * https://developers.arcgis.com/calcite-design-system/get-started/#choose-a-build
 **/
import { setAssetPath } from '@esri/calcite-components/dist/components';
import '@esri/calcite-components/dist/components/calcite-shell';
import '@esri/calcite-components/dist/components/calcite-shell-panel';
import '@esri/calcite-components/dist/components/calcite-panel';
import '@esri/calcite-components/dist/components/calcite-button';
import '@esri/calcite-components/dist/components/calcite-icon';
import '@esri/calcite-components/dist/components/calcite-date-picker';
import '@esri/calcite-components/dist/components/calcite-loader';

import '@esri/calcite-components/dist/calcite/calcite.css';
import './style.css';

setAssetPath(location.href);

// const loader = document.createElement('calcite-loader');
// document.body.appendChild(loader);

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;

const map = new Map({
  basemap: 'arcgis/community',
});

const view = new MapView({
  container: 'viewDiv',
  map,
  center: [-71.6899, 43.7598],
  zoom: 12,
});
