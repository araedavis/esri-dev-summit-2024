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

queryFeatures({ url: featureServiceUrl, where: "Status = 'Active'" })
  .then((layer) => normalizeSiteData(layer))
  .then((data) => displayAllCards(data))
  .then((data) => filterResults(data))
  .catch((error) => {
    console.log(error);
  });

// Remaps feature service attributes to simpler data object and converts products to array
function normalizeSiteData(layer) {
  return layer.features.map((feature) => {
    return {
      farm: feature.attributes["Farm_Name"],
      description: feature.attributes["FarmDescript"],
      address: feature.attributes["Location"],
      products: feature.attributes["Main_Products"].toLowerCase().split(", "),
      website: feature.attributes["Website"],
      email: feature.attributes["email"],
    };
  });
}

// Attaches calcite-chip-group custom event
function filterResults(sites) {
  document.addEventListener("calciteChipGroupSelect", (e) => {
    container.replaceChildren("");
    const filters = e.target.selectedItems.map((selected) => selected.value);

    // Loop through sites in order to determine which site's products match the chip-group values
    sites.forEach((site) => {
      const isMatch =
        site.products.filter((product) =>
          filters.includes(product.replace(" ", "_"))
        ).length === filters.length;
      if (isMatch) {
        displayCard(site);
      }
    });
  });
}

function displayAllCards(sites) {
  container.replaceChildren("");
  sites.forEach((site) => {
    displayCard(site);
  });
  return sites;
}

function displayCard(site) {
  const { farm, address, description, website, email, products } = site;
  const card = `<article class="farm">
  <header>
    <h6>${farm}</h6>
    <p>${address}</p>
  </header>
  <ul class="products">${getChips(products)}</ul>
  <p class="description">${description}</p>
  <footer>
    <a href=${website} target="_blank" label="Visit ${farm} website"><calcite-icon icon="web" scale="m" /></a>
    <a href="mailto:${email}" label="Contact ${farm}"><calcite-icon icon="envelope" scale="m" /></a>
  </footer>
</article>
`;
  const cardElement = document.createRange().createContextualFragment(card);
  container.appendChild(cardElement);
}

function getChips(products) {
  const chips = products.map((product) => {
    const productId = product.replace(" ", "_");
    const content = EMOJI[productId];
    return content ? `<li>${content}</li>` : "";
  });
  return chips.join("");
}
