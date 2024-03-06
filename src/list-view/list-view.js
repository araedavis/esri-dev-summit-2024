/**
 * This example uses the Distribution build of Calcite Components.
 * Refer to the documentation if switching to the Custom Elements build:
 * https://developers.arcgis.com/calcite-design-system/get-started/#choose-a-build
 **/
import "@esri/calcite-components/dist/calcite/calcite.css";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";

import { queryFeatures } from "@esri/arcgis-rest-feature-service";

// load calcite components
defineCustomElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.6.0/assets",
});

/**
 * List-view page
 */

const container = document.querySelector(".card-container");

// const chip = `<calcite-chip id="chip-1" value="calcite-chip" scale="s">&#129365;</calcite-chip>`;
// const chipElement = document.createRange().createContextualFragment(chip);
// card.appendChild(chipElement); 

const featureServiceUrl =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188";

queryFeatures({ url: featureServiceUrl, where: "Status = 'Active'"}).then(layer => {
  return normalizeData(layer);
}).then(sites => {
  filterResults(sites)
});

function normalizeData(data) {
  return data.features.map(feature => {
    return {
      farm: feature.attributes["Farm_Name"],
      description: feature.attributes["FarmDescript"],
      address: feature.attributes["Location"],
      products: feature.attributes["Main_Products"].toLowerCase().split(", "),
    };
  })
}

function filterResults(features) {
  document.addEventListener("calciteComboboxChange", (e) => {
    container.replaceChildren("");
    const filters = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
    features.forEach(feature => {
      const isMatch = feature.products.filter(product => filters.includes(product)).length === filters.length;
      if (isMatch) {
        const card = `<calcite-card>
          <span slot="heading">${feature.farm}</span>
          <span slot="description">${feature.address}</span>
          <p>${feature.description}</p>
          ${feature.products}
        </calcite-card>`;
        const cardElement = document.createRange().createContextualFragment(card);
        container.appendChild(cardElement);

      }
    })
  })
}
