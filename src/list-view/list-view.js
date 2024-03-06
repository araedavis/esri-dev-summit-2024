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

const EMOJI = {
  vegetables: "&#129365;",
  fruit: "&#127817;",
  berries: "&#127827;",
  mushrooms: "&#127812;",
  eggs: "&#129370;",
  dairy: "&#129371;",
  meat: "&#129385;",
  fish: "&#128031;",
  honey: "&#127855;",
  herbs: "&#127807;",
  flowers: "&#127803;",
  plant_starts: "&#127793;",
};

const container = document.querySelector(".card-container");

const featureServiceUrl =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188";

queryFeatures({ url: featureServiceUrl, where: "Status = 'Active'"}).then(layer => {
  console.log(layer);
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
      website: feature.attributes["Website"],
      email: feature.attributes["email"]

    };
  })
}

function filterResults(features) {
  document.addEventListener("calciteComboboxChange", (e) => {
    container.replaceChildren("");
    const filters = Array.isArray(e.target.value) ? e.target.value : [e.target.value];
    features.forEach(feature => {
      const isMatch = feature.products.filter(product => filters.includes(product.replace(" ", "_"))).length === filters.length;
      if (isMatch) {
        const card = `<calcite-card>
          <span slot="heading">${feature.farm}</span>
          <span slot="description">${feature.address}</span>
          <p>${feature.description}</p>
          ${feature.products}
          <calcite-button icon-end="launch" href=${feature.website} target="_blank">Visit website</calcite-button>
          <calcite-button icon-end="envelope" href="mailto:${feature.email}">Contact us</calcite-button>
          <div slot="footer-start"></div>
          <div slot="footer-end">${getChips(feature.products)}</div>
        </calcite-card>`;
        const cardElement = document.createRange().createContextualFragment(card);
        container.appendChild(cardElement);

      }
    })
  })

  function getChips(products) {
    const chips = products.map(product => {
      const productId = product.replace(" ", "_")
      const content = EMOJI[productId];
      return content ? `<calcite-chip scale="s">${content}</calcite-chip>` : "";
    })
    return chips.join("");
  }
}
