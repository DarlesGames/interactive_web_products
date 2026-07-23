"use strict";

const STORAGE_KEY = "darlesLanguage";
const catalogContent = document.querySelector("#catalog-content");
const filters = document.querySelector("#category-filters");
const languageSwitcher = document.querySelector(".language-switcher");

const ui = {
  ru: {
    skip: "Перейти к каталогу",
    languageLabel: "Язык",
    heroEyebrow: "Интерактивная библиотека",
    heroTitle: "Небольшие веб-продукты с большим эффектом",
    viewProducts: "Смотреть продукты",
    demoCount: "демо",
    collection: "Коллекция",
    chooseFormat: "Выберите формат",
    filterLabel: "Фильтр продуктов",
    allProducts: "Все продукты",
    loading: "Загружаем продукты…",
    featured: "Выбор Darles",
    openDemo: "Открыть демо",
    productsCount: "Продуктов",
    loadError: "Каталог не удалось загрузить.",
    loadHint: "Запустите сайт через локальный HTTP-сервер и обновите страницу.",
    footerTagline: "Интерактивные решения для вовлечения аудитории.",
    copyright: "© 2026 Алексей Спирин. Опубликовано под брендом Darles Games. Все права защищены.",
  },
  en: {
    skip: "Skip to catalog",
    languageLabel: "Language",
    heroEyebrow: "Interactive library",
    heroTitle: "Small web products with a big impact",
    viewProducts: "View products",
    demoCount: "demos",
    collection: "Collection",
    chooseFormat: "Choose a format",
    filterLabel: "Product filter",
    allProducts: "All products",
    loading: "Loading products…",
    featured: "Darles pick",
    openDemo: "Open demo",
    productsCount: "Products",
    loadError: "The catalog could not be loaded.",
    loadHint: "Start the site through a local HTTP server and refresh the page.",
    footerTagline: "Interactive solutions that engage audiences.",
    copyright: "© 2026 Alexey Spirin. Published under the Darles Games brand. All rights reserved.",
  },
};

const categoryIcons = {
  quizzes: "✦",
  "promo-games": "◆",
  greetings: "♡",
};

let products = [];
let activeCategory = "all";
let language = getInitialLanguage();

function getInitialLanguage() {
  const queryLanguage = new URLSearchParams(location.search).get("lang");
  if (queryLanguage === "ru" || queryLanguage === "en") return queryLanguage;

  try {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage === "ru" || savedLanguage === "en") return savedLanguage;
  } catch {
    // The catalog still works when storage is unavailable.
  }
  return "ru";
}

function saveLanguage() {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The current page and query parameters still preserve the language.
  }
}

function translateProduct(product) {
  return { ...product, ...(product.translations?.[language] || {}) };
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createProductCard(sourceProduct) {
  const product = translateProduct(sourceProduct);
  const copy = ui[language];
  const card = createElement("article", `product-card${product.featured ? " featured" : ""}`);
  card.dataset.category = product.category;

  const icon = createElement("span", "product-icon", categoryIcons[product.category] || "•");
  icon.setAttribute("aria-hidden", "true");

  const meta = createElement("div", "card-meta");
  meta.append(createElement("span", "status", product.status));
  if (product.featured) meta.append(createElement("span", "featured-label", copy.featured));

  const title = createElement("h3", "", product.title);
  const description = createElement("p", "product-description", product.description);
  const link = createElement("a", "demo-link", copy.openDemo);
  link.href = `./${encodeURIComponent(product.folder)}/?lang=${language}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `${copy.openDemo}: ${product.title}`);

  card.append(icon, meta, title, description, link);
  return card;
}

function getCategories() {
  const categories = new Map();
  [...products].sort((a, b) => a.order - b.order).forEach((sourceProduct) => {
    const product = translateProduct(sourceProduct);
    if (!categories.has(product.category)) {
      categories.set(product.category, { title: product.categoryTitle, products: [] });
    }
    categories.get(product.category).products.push(sourceProduct);
  });
  return categories;
}

function renderFilters() {
  const categories = getCategories();
  const fragment = document.createDocumentFragment();
  const options = [["all", ui[language].allProducts], ...[...categories].map(([id, item]) => [id, item.title])];

  options.forEach(([id, label]) => {
    const button = createElement("button", "", label);
    button.type = "button";
    button.dataset.category = id;
    button.setAttribute("aria-pressed", String(activeCategory === id));
    button.addEventListener("click", () => {
      activeCategory = id;
      renderFilters();
      renderCatalog();
    });
    fragment.append(button);
  });

  filters.replaceChildren(fragment);
}

function renderCatalog() {
  const categories = getCategories();
  const fragment = document.createDocumentFragment();

  categories.forEach((category, categoryId) => {
    if (activeCategory !== "all" && activeCategory !== categoryId) return;

    const section = createElement("section", "category");
    section.setAttribute("aria-labelledby", `category-${categoryId}`);
    const header = createElement("div", "category-header");
    const title = createElement("h3", "category-title", category.title);
    title.id = `category-${categoryId}`;
    const count = createElement("span", "category-count", String(category.products.length));
    count.setAttribute("aria-label", `${ui[language].productsCount}: ${category.products.length}`);
    header.append(title, count);

    const grid = createElement("div", "product-grid");
    category.products.forEach((product) => grid.append(createProductCard(product)));
    section.append(header, grid);
    fragment.append(section);
  });

  catalogContent.replaceChildren(fragment);
}

function applyLanguage() {
  const copy = ui[language];
  document.documentElement.lang = language;
  document.title = language === "ru"
    ? "Интерактивные веб-продукты — Darles Games"
    : "Interactive web products — Darles Games";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = copy[element.dataset.i18n];
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", copy[element.dataset.i18nAria]);
  });
  languageSwitcher.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  renderFilters();
  renderCatalog();
}

function renderError() {
  const message = createElement("p", "catalog-message");
  message.append(
    createElement("strong", "", `${ui[language].loadError} `),
    ui[language].loadHint,
  );
  catalogContent.replaceChildren(message);
}

languageSwitcher.addEventListener("click", (event) => {
  const button = event.target.closest("[data-language]");
  if (!button || button.dataset.language === language) return;
  language = button.dataset.language;
  saveLanguage();
  applyLanguage();
});

fetch("./catalog/products.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((data) => {
    if (!Array.isArray(data)) throw new TypeError("Expected an array of products");
    products = data;
    applyLanguage();
  })
  .catch((error) => {
    console.error("Could not load the catalog:", error);
    renderError();
  });
