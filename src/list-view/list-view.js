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

const CATEGORY_MAP = {
  vegetables: {
    products: ["winter vegetables", "vegggies", "organic vegetables"],
    emoji: "🥕",
  },
  fruit: { products: ["tree fruit"], emoji: "🍉" },
  berries: { products: [], emoji: "🫐" },
  mushrooms: { products: [], emoji: "🍄" },
  eggs: { products: [], emoji: "🥚" },
  dairy: { products: ["raw milk", "milk"], emoji: "🥛" },
  meat: { products: [], emoji: "🥩" },
  fish: {
    products: ["fish (tuna)", "fish (salmon)", "wild sockeye salmon"],
    emoji: "🐟",
  },
  honey: { products: [], emoji: "🐝" },
  herbs: { products: [], emoji: "🪴" },
  flowers: { products: [], emoji: "🌻" },
  plant_starts: { products: ["plant starts", "plants"], emoji: "🌱" },
  bread: { products: [], emoji: "🍞" },
  chicken: { products: [], emoji: "🐓" },
  pork: { products: [], emoji: "🐖" },
};

const container = document.querySelector(".card-container");

const featureServiceUrl =
  "https://www.portlandmaps.com/od/rest/services/COP_OpenData_ImportantPlaces/MapServer/188";

queryFeatures({ url: featureServiceUrl, where: "Status = 'Active'", returnGeometry: false })
  .then((layer) => normalizeSiteData(layer))
  .then((data) => displayAllCards(data))
  .then((data) => filterResults(data))
  .catch((error) => {
    console.log(error);
  });

// Maps feature service attributes to simpler data object and converts products to array
function normalizeSiteData(layer) {
  return layer.features.map((feature) => {
    return {
      farm: feature.attributes["Farm_Name"],
      description: feature.attributes["FarmDescript"],
      address: feature.attributes["Location"],
      products: categorizeProducts(feature.attributes["Main_Products"]),
      website: feature.attributes["Website"],
      email: feature.attributes["email"],
    };
  });
}

function categorizeProducts(productString) {
  const categories = Object.keys(CATEGORY_MAP);
  // Trim any leading or trailing white space and lowercase strings before splitting into an array
  const remapped = productString.trim().toLowerCase().split(", ").map(product => {
    if (categories.includes(product)) {
      return product;
    }
    // Iterate through categories and their products to find the correct category
    for (const category in CATEGORY_MAP) {
      if (CATEGORY_MAP[category].products.includes(product)) {
        return category; 
      }
    } 
  });
  // Return the grouped products but first filter out any undefined or duplicate values
  return remapped.filter((category, index) => category && remapped.indexOf(category) === index);
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
    const content = CATEGORY_MAP[product].emoji;
    return content ? `<li>${content}</li>` : "";
  });
  return chips.join("");
}
