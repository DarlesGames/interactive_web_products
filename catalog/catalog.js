"use strict";

const catalogContent = document.querySelector("#catalog-content");

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function createProductCard(product) {
  const card = createElement("article", `product-card${product.featured ? " featured" : ""}`);
  const meta = createElement("div", "card-meta");
  meta.append(createElement("span", "status", product.status));

  if (product.featured) {
    meta.append(createElement("span", "featured-label", "Выбор Darles"));
  }

  const title = createElement("h3", "", product.title);
  const description = createElement("p", "product-description", product.description);
  const link = createElement("a", "demo-link", "Открыть демо");
  link.href = `./${encodeURIComponent(product.folder)}/`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", `Открыть демо «${product.title}» в новой вкладке`);

  card.append(meta, title, description, link);
  return card;
}

function renderCatalog(products) {
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);
  const categories = new Map();

  sortedProducts.forEach((product) => {
    if (!categories.has(product.category)) {
      categories.set(product.category, {
        title: product.categoryTitle,
        products: [],
      });
    }
    categories.get(product.category).products.push(product);
  });

  const fragment = document.createDocumentFragment();

  categories.forEach((category, categoryId) => {
    const section = createElement("section", "category");
    section.setAttribute("aria-labelledby", `category-${categoryId}`);

    const header = createElement("div", "category-header");
    const title = createElement("h3", "category-title", category.title);
    title.id = `category-${categoryId}`;
    const count = createElement("span", "category-count", String(category.products.length));
    count.setAttribute("aria-label", `Продуктов: ${category.products.length}`);
    header.append(title, count);

    const grid = createElement("div", "product-grid");
    category.products.forEach((product) => grid.append(createProductCard(product)));
    section.append(header, grid);
    fragment.append(section);
  });

  catalogContent.replaceChildren(fragment);
}

function renderError() {
  const message = createElement("p", "catalog-message");
  const lead = createElement("strong", "", "Каталог не удалось загрузить. ");
  message.append(lead, "Запустите сайт через локальный HTTP-сервер и обновите страницу.");
  catalogContent.replaceChildren(message);
}

fetch("./catalog/products.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((products) => {
    if (!Array.isArray(products)) throw new TypeError("Ожидался массив продуктов");
    renderCatalog(products);
  })
  .catch((error) => {
    console.error("Не удалось загрузить каталог:", error);
    renderError();
  });
